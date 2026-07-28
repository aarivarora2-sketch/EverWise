import Capacitor
import UIKit
import WebKit

@objc(EverwiseBridgeViewController)
final class EverwiseBridgeViewController: CAPBridgeViewController {
    override func capacitorDidLoad() {
        super.capacitorDidLoad()
        bridge?.registerPluginInstance(EverwisePurchasesPlugin())

        let cream = UIColor(red: 239 / 255, green: 233 / 255, blue: 220 / 255, alpha: 1)
        webView?.isOpaque = false
        webView?.backgroundColor = cream
        webView?.scrollView.backgroundColor = cream
        webView?.scrollView.contentInsetAdjustmentBehavior = .never
        webView?.scrollView.keyboardDismissMode = .interactive
        webView?.allowsBackForwardNavigationGestures = false
    }

    override var preferredStatusBarStyle: UIStatusBarStyle {
        .darkContent
    }
}
