/**
 * Resend Email Service Configuration
 * Handles sending email notifications for task reminders
 */

import { Resend } from 'resend';

// Initialize Resend with API key from environment variables
const resend = new Resend(process.env.RESEND_API_KEY);

export interface TaskReminderEmailData {
  to: string;
  userName: string;
  taskTitle: string;
  taskDescription?: string;
  dueDate?: string;
  dueTime?: string;
  priority: 'low' | 'medium' | 'high';
  category?: string;
  taskUrl: string;
}

/**
 * Send task reminder email
 * @param data Email data including task details
 * @returns Promise with email send result
 */
export async function sendTaskReminderEmail(data: TaskReminderEmailData) {
  try {
    const { to, userName, taskTitle, taskDescription, dueDate, dueTime, priority, category, taskUrl } = data;

    // Priority badge styling
    const priorityConfig = {
      high: { color: '#dc2626', label: 'HIGH PRIORITY', bg: '#fee2e2' },
      medium: { color: '#d97706', label: 'MEDIUM PRIORITY', bg: '#fef3c7' },
      low: { color: '#16a34a', label: 'LOW PRIORITY', bg: '#dcfce7' },
    };

    const config = priorityConfig[priority];

    // Format date and time
    const formattedDate = dueDate ? new Date(dueDate).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }) : '';

    const formattedTime = dueTime || '';

    const { data: result, error } = await resend.emails.send({
      from: 'OrganizeNow <reminders@organizenow.app>', // Change this to your verified domain
      to: [to],
      subject: `⏰ Task Reminder: ${taskTitle}`,
      html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Task Reminder</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f9fafb;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f9fafb; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 16px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); overflow: hidden;">

          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #9333ea 0%, #7c3aed 100%); padding: 40px 40px 30px; text-align: center;">
              <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 700; letter-spacing: -0.5px;">
                ⏰ Task Reminder
              </h1>
              <p style="margin: 10px 0 0; color: #e9d5ff; font-size: 14px;">
                OrganizeNow
              </p>
            </td>
          </tr>

          <!-- Priority Badge -->
          <tr>
            <td style="padding: 30px 40px 20px;">
              <div style="background-color: ${config.bg}; color: ${config.color}; padding: 8px 16px; border-radius: 20px; font-size: 12px; font-weight: 700; letter-spacing: 0.5px; display: inline-block;">
                ${config.label}
              </div>
            </td>
          </tr>

          <!-- Greeting -->
          <tr>
            <td style="padding: 0 40px 20px;">
              <p style="margin: 0; color: #111827; font-size: 16px; line-height: 1.5;">
                Hi <strong>${userName}</strong>,
              </p>
              <p style="margin: 10px 0 0; color: #6b7280; font-size: 14px; line-height: 1.5;">
                This is a reminder for your upcoming task:
              </p>
            </td>
          </tr>

          <!-- Task Details Card -->
          <tr>
            <td style="padding: 0 40px 30px;">
              <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f9fafb; border-radius: 12px; border: 2px solid ${config.color}; padding: 24px;">
                <tr>
                  <td>
                    <h2 style="margin: 0 0 12px 0; color: #111827; font-size: 20px; font-weight: 700; line-height: 1.3;">
                      ${taskTitle}
                    </h2>
                    ${taskDescription ? `
                      <p style="margin: 0 0 16px 0; color: #4b5563; font-size: 14px; line-height: 1.6;">
                        ${taskDescription}
                      </p>
                    ` : ''}

                    <!-- Metadata -->
                    <table cellpadding="0" cellspacing="0">
                      ${formattedDate ? `
                        <tr>
                          <td style="padding: 6px 0;">
                            <span style="color: #6b7280; font-size: 13px;">
                              📅 <strong>Due Date:</strong> ${formattedDate}
                            </span>
                          </td>
                        </tr>
                      ` : ''}
                      ${formattedTime ? `
                        <tr>
                          <td style="padding: 6px 0;">
                            <span style="color: #6b7280; font-size: 13px;">
                              🕐 <strong>Time:</strong> ${formattedTime}
                            </span>
                          </td>
                        </tr>
                      ` : ''}
                      ${category ? `
                        <tr>
                          <td style="padding: 6px 0;">
                            <span style="display: inline-block; background-color: #ede9fe; color: #7c3aed; padding: 4px 12px; border-radius: 12px; font-size: 12px; font-weight: 600;">
                              ${category}
                            </span>
                          </td>
                        </tr>
                      ` : ''}
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- CTA Button -->
          <tr>
            <td style="padding: 0 40px 40px; text-align: center;">
              <a href="${taskUrl}" style="display: inline-block; background-color: #9333ea; color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 10px; font-size: 16px; font-weight: 600; box-shadow: 0 4px 6px rgba(147, 51, 234, 0.3);">
                View Task Details
              </a>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #f9fafb; padding: 24px 40px; border-top: 1px solid #e5e7eb;">
              <p style="margin: 0; color: #9ca3af; font-size: 12px; line-height: 1.5; text-align: center;">
                You're receiving this email because you have a task reminder scheduled in OrganizeNow.
                <br>
                <a href="${taskUrl}" style="color: #9333ea; text-decoration: none;">Manage your tasks</a>
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
      `,
    });

    if (error) {
      console.error('[Email] Failed to send reminder:', error);
      throw error;
    }

    console.log('[Email] Reminder sent successfully:', result);
    return { success: true, messageId: result?.id };
  } catch (error) {
    console.error('[Email] Error sending reminder:', error);
    throw error;
  }
}

/**
 * Verify email service configuration
 * @returns Promise<boolean> indicating if service is configured
 */
export async function verifyEmailService(): Promise<boolean> {
  try {
    if (!process.env.RESEND_API_KEY) {
      console.warn('[Email] RESEND_API_KEY not configured');
      return false;
    }
    return true;
  } catch (error) {
    console.error('[Email] Email service verification failed:', error);
    return false;
  }
}
