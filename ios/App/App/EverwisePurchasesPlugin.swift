import Capacitor
import StoreKit

@objc(EverwisePurchasesPlugin)
final class EverwisePurchasesPlugin: CAPPlugin, CAPBridgedPlugin {
    let identifier = "EverwisePurchasesPlugin"
    let jsName = "EverwisePurchases"
    let pluginMethods: [CAPPluginMethod] = [
        CAPPluginMethod(name: "getProducts", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "purchase", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "restore", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "currentEntitlement", returnType: CAPPluginReturnPromise)
    ]

    private let productIDs = [
        "com.everwise.app.annual",
        "com.everwise.app.monthly"
    ]

    @objc func getProducts(_ call: CAPPluginCall) {
        Task {
            do {
                let products = try await Product.products(for: productIDs)
                let payload: [[String: Any]] = products.map { product in
                    [
                        "id": product.id,
                        "displayName": product.displayName,
                        "displayPrice": product.displayPrice,
                        "description": product.description
                    ]
                }
                call.resolve(["products": payload])
            } catch {
                call.reject("Subscription options could not be loaded.", "PRODUCTS_UNAVAILABLE", error)
            }
        }
    }

    @objc func purchase(_ call: CAPPluginCall) {
        guard let productID = call.getString("productId"), productIDs.contains(productID) else {
            call.reject("A valid subscription option is required.", "INVALID_PRODUCT")
            return
        }

        Task {
            do {
                guard let product = try await Product.products(for: [productID]).first else {
                    call.reject("This subscription option is not available.", "PRODUCT_NOT_FOUND")
                    return
                }

                switch try await product.purchase() {
                case .success(let verification):
                    let transaction = try verified(verification)
                    await transaction.finish()
                    call.resolve(entitlementPayload(for: transaction))
                case .pending:
                    call.reject("The purchase is waiting for approval.", "PURCHASE_PENDING")
                case .userCancelled:
                    call.reject("The purchase was cancelled.", "PURCHASE_CANCELLED")
                @unknown default:
                    call.reject("The purchase could not be completed.", "PURCHASE_UNKNOWN")
                }
            } catch {
                call.reject("The purchase could not be completed.", "PURCHASE_FAILED", error)
            }
        }
    }

    @objc func restore(_ call: CAPPluginCall) {
        Task {
            do {
                try await AppStore.sync()
                call.resolve(await currentEntitlementPayload())
            } catch {
                call.reject("Purchases could not be restored.", "RESTORE_FAILED", error)
            }
        }
    }

    @objc func currentEntitlement(_ call: CAPPluginCall) {
        Task {
            call.resolve(await currentEntitlementPayload())
        }
    }

    private func currentEntitlementPayload() async -> [String: Any] {
        for await result in Transaction.currentEntitlements {
            guard case .verified(let transaction) = result,
                  productIDs.contains(transaction.productID),
                  transaction.revocationDate == nil,
                  transaction.expirationDate.map({ $0 > Date() }) ?? true else {
                continue
            }
            return entitlementPayload(for: transaction)
        }
        return ["active": false]
    }

    private func entitlementPayload(for transaction: Transaction) -> [String: Any] {
        var payload: [String: Any] = [
            "active": true,
            "productId": transaction.productID
        ]
        if let expirationDate = transaction.expirationDate {
            payload["expirationDate"] = ISO8601DateFormatter().string(from: expirationDate)
        }
        return payload
    }

    private func verified<T>(_ result: VerificationResult<T>) throws -> T {
        switch result {
        case .verified(let value):
            return value
        case .unverified(_, let error):
            throw error
        }
    }
}
