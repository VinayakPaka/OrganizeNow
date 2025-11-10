/**
 * Test Email API Route
 * Quick endpoint to test if email service is configured correctly
 *
 * Usage: http://localhost:3000/api/test-email?to=your-email@example.com
 */

import { NextResponse } from 'next/server';
import { sendTaskReminderEmail, verifyEmailService } from '@/lib/email/resend';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const toEmail = searchParams.get('to');

    if (!toEmail) {
      return NextResponse.json({
        error: 'Missing email parameter',
        usage: '/api/test-email?to=your-email@example.com'
      }, { status: 400 });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(toEmail.trim())) {
      return NextResponse.json({
        error: 'Invalid email format',
        usage: '/api/test-email?to=your-email@example.com'
      }, { status: 400 });
    }

    // Verify email service is configured
    const isConfigured = await verifyEmailService();
    if (!isConfigured) {
      return NextResponse.json({
        error: 'Email service not configured',
        message: 'Please set RESEND_API_KEY in your environment variables'
      }, { status: 500 });
    }

    // Send test email
    const result = await sendTaskReminderEmail({
      to: toEmail,
      userName: 'Test User',
      taskTitle: 'Test Task Reminder',
      taskDescription: 'This is a test email to verify your email notification setup is working correctly.',
      dueDate: new Date(Date.now() + 86400000).toISOString().split('T')[0], // Tomorrow
      dueTime: '14:00',
      priority: 'high',
      category: 'Testing',
      taskUrl: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000/tasks',
    });

    return NextResponse.json({
      success: true,
      message: `Test email sent successfully to ${toEmail}`,
      messageId: result.messageId,
      note: 'Check your inbox and spam folder'
    });

  } catch (error: any) {
    console.error('[Test Email] Error:', error);
    return NextResponse.json({
      error: 'Failed to send test email',
      message: error.message,
      details: error.toString()
    }, { status: 500 });
  }
}
