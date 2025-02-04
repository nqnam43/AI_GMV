<?php

namespace App\Http\Controllers\Webhooks;

use App\Enums\Payments\TypePayment;
use App\Http\Controllers\Controller;
use App\Models\WebhookRequestLog;
use App\Services\Payment\PaymentProduct;
use App\Services\Payment\PaymentService;
use App\Services\Payment\PaymentStrategyContext;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class PaymentController extends Controller
{
    public $paymentService;

    public function __construct(PaymentService $paymentService)
    {
        $this->paymentService = $paymentService;
    }

    public function __invoke(Request $request)
    {
        WebhookRequestLog::create([
            'info' => json_encode([
                'headers' => $request->headers->all(),
                'body' => $request->all(),
                'ip' => $request->ip()
            ])
        ]);

        $paymentData = $request->get("payment", []);

        if (empty($paymentData['content']) || !Str::contains($paymentData['content'] ?? "", "GMV")) {
            return response()->json([
                'status'    =>  'failed',
                'message'   => 'Giao dịch không hợp lệ',
            ], 400);
        }

        preg_match('/\b\w*PRODUCT\w*\b/', $paymentData['content'], $paymentCode);
        
        if (!isset($paymentCode)) {
            return response()->json([
                'status'    =>  'failed',
                'message'   => 'Validate payment_code error',
            ], 400);
        }

        $payment = $this->paymentService->getPayment($paymentCode);

        if (!$payment) {
            return response()->json([
                'status'    =>  'failed',
                'message'   => 'Giao dịch không khả dụng!',
            ], 404);
        }

        $payemntTypeInstance = null;

        if ($payment->type === TypePayment::PRODUCT->value) {
            $payemntTypeInstance = new PaymentProduct();
        }

        $paymentContext = new PaymentStrategyContext($payemntTypeInstance);

        $result = $paymentContext->handleWebhook($payment, $paymentData['amount']);

        if (is_array($result) && $result['status'] === false) {
            return response()->json([
                'status'    =>  'failed',
                'message'   => $result['message'],
            ], 400);
        }

        return response()->json([
            'status'    =>  'success',
            'message'   => '',
        ]);
    }
}
