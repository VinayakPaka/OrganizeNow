# Email Notifications Setup Guide

This guide will help you set up email notifications for task reminders that work even when the browser is closed.

## Overview

The email notification system sends reminder emails automatically based on your task's due date and reminder time. It works 24/7, even when:
- ✅ Your browser is closed
- ✅ Your computer is off
- ✅ You're not on the website
- ✅ The app is not running

## How It Works

1. **You create a task** with a due date and reminder time
2. **Background cron job** runs every minute on the server
3. **System checks** if any tasks need email reminders
4. **Email is sent** automatically when reminder time arrives
5. **Email marked as sent** to prevent duplicates

## Setup Steps

### 1. Get Resend API Key

1. Go to [resend.com](https://resend.com)
2. Sign up for a free account (100 emails/day free)
3. Verify your email address
4. Go to **API Keys** section
5. Create a new API key
6. Copy the API key (starts with `re_`)

### 2. Configure Domain (Optional but Recommended)

For production, verify your domain:
1. In Resend dashboard, go to **Domains**
2. Add your domain (e.g., `organizenow.app`)
3. Add DNS records as shown
4. Update email sender in `src/lib/email/resend.ts`:
   ```typescript
   from: 'OrganizeNow <reminders@yourdomain.com>'
   ```

For testing, you can use Resend's test domain.

### 3. Add Environment Variables

Add these to your `.env.local` file:

```bash
# Email Notifications (Resend)
RESEND_API_KEY=re_your_actual_resend_api_key_here
NEXT_PUBLIC_APP_URL=http://localhost:3000  # Change to your production URL

# Cron Job Security (generate a random string)
CRON_SECRET=some_random_secret_string_here
```

**Generate a secure CRON_SECRET:**
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### 4. Run Database Migration

Apply the database migration to add email tracking columns:

**Option A: Using Supabase CLI (Recommended)**
```bash
# If you have Supabase CLI installed
supabase db push

# Or apply manually in Supabase Dashboard
```

**Option B: Manual SQL (Supabase Dashboard)**
1. Go to your Supabase project dashboard
2. Click **SQL Editor**
3. Copy contents from `supabase/migrations/add_email_tracking.sql`
4. Paste and run the SQL

The migration adds:
- `email_sent` column (tracks if email was sent)
- `email_sent_at` column (timestamp of when email was sent)
- Indexes for performance
- Triggers to reset email status when task is updated

### 5. Deploy to Vercel

The cron job requires deployment to work. Vercel provides free cron jobs.

1. **Push code to GitHub:**
   ```bash
   git add .
   git commit -m "Add email notifications"
   git push
   ```

2. **Deploy to Vercel:**
   - Go to [vercel.com](https://vercel.com)
   - Import your GitHub repository
   - Add environment variables (from step 3)
   - Deploy

3. **Verify Cron Job:**
   - Go to your Vercel project dashboard
   - Click on **Cron Jobs** tab
   - You should see `/api/cron/send-reminders` running every minute

### 6. Test Email Notifications

1. **Create a test task:**
   - Due date: Today
   - Due time: 5 minutes from now
   - Reminder: 2 minutes before

2. **Wait for reminder time**
   - Cron job runs every minute
   - Check your email inbox

3. **Verify in logs:**
   ```bash
   # In Vercel dashboard, check Function Logs
   # Look for: "[Cron] ✅ Email sent for task: ..."
   ```

## Alternative: Local Development with Cron

For local testing without Vercel:

### Option 1: Use node-cron (Recommended for Local)

Install node-cron:
```bash
npm install node-cron
```

Create `src/lib/cron/scheduler.ts`:
```typescript
import cron from 'node-cron';

export function startEmailReminderCron() {
  // Run every minute
  cron.schedule('* * * * *', async () => {
    try {
      const response = await fetch('http://localhost:3000/api/cron/send-reminders', {
        headers: {
          'Authorization': `Bearer ${process.env.CRON_SECRET}`
        }
      });
      const data = await response.json();
      console.log('[Cron] Email check:', data);
    } catch (error) {
      console.error('[Cron] Error:', error);
    }
  });

  console.log('[Cron] Email reminder scheduler started');
}
```

Add to your app startup (e.g., in a server component or API route).

### Option 2: External Cron Service

Use a free external cron service:

1. **cron-job.org** (Recommended):
   - Sign up at [cron-job.org](https://cron-job.org)
   - Create a new cron job
   - URL: `https://your-app.vercel.app/api/cron/send-reminders`
   - Schedule: Every 1 minute
   - Add header: `Authorization: Bearer YOUR_CRON_SECRET`

2. **EasyCron**:
   - Similar setup at [easycron.com](https://easycron.com)

## Troubleshooting

### Emails Not Sending

1. **Check Resend API Key:**
   ```bash
   # Verify key is set correctly
   echo $RESEND_API_KEY
   ```

2. **Check Database:**
   - Open Supabase dashboard
   - Go to Table Editor > tasks
   - Verify `email_sent` and `email_sent_at` columns exist

3. **Check Cron Logs:**
   - In Vercel dashboard, go to Functions
   - Click on `/api/cron/send-reminders`
   - Check logs for errors

4. **Test Email Service:**
   Create a test API route:
   ```typescript
   // src/app/api/test-email/route.ts
   import { sendTaskReminderEmail } from '@/lib/email/resend';

   export async function GET() {
     await sendTaskReminderEmail({
       to: 'your-email@example.com',
       userName: 'Test User',
       taskTitle: 'Test Task',
       priority: 'high',
       taskUrl: 'http://localhost:3000/tasks'
     });
     return Response.json({ success: true });
   }
   ```

   Visit: `http://localhost:3000/api/test-email`

### Cron Job Not Running

1. **Verify vercel.json exists**
2. **Check Vercel Cron tab** - job should be listed
3. **Check authorization** - CRON_SECRET matches in both places

### Database Errors

If migration fails:
1. Check if columns already exist
2. Drop and recreate if needed:
   ```sql
   ALTER TABLE tasks DROP COLUMN IF EXISTS email_sent;
   ALTER TABLE tasks DROP COLUMN IF EXISTS email_sent_at;
   ```
3. Re-run migration

## Configuration Options

### Change Email Frequency

Edit `vercel.json`:
```json
{
  "crons": [
    {
      "path": "/api/cron/send-reminders",
      "schedule": "*/5 * * * *"  // Every 5 minutes
    }
  ]
}
```

Cron schedule format:
```
* * * * *
│ │ │ │ │
│ │ │ │ └─ Day of week (0-7)
│ │ │ └─── Month (1-12)
│ │ └───── Day of month (1-31)
│ └─────── Hour (0-23)
└───────── Minute (0-59)
```

Examples:
- Every minute: `* * * * *`
- Every 5 minutes: `*/5 * * * *`
- Every hour: `0 * * * *`
- Every day at 9am: `0 9 * * *`

### Customize Email Template

Edit `src/lib/email/resend.ts`:
- Change colors
- Modify HTML structure
- Add your branding
- Change sender name/email

### Add More Email Types

You can create additional email functions:
```typescript
export async function sendTaskCompletionEmail(data) { ... }
export async function sendDailyDigestEmail(data) { ... }
```

## Cost Considerations

**Resend Free Tier:**
- 100 emails/day
- 3,000 emails/month
- Perfect for personal use

**Vercel Free Tier:**
- Unlimited cron jobs
- 100 GB-hours compute time/month
- More than enough for this use case

For heavy usage (100+ tasks/day), consider:
- Resend Pro: $20/month for 50,000 emails
- Or use SendGrid, AWS SES, etc.

## Security Notes

1. **Protect Cron Endpoint:**
   - Always use CRON_SECRET
   - Don't expose secret in client code
   - Rotate secret periodically

2. **Email Privacy:**
   - Never include sensitive data in emails
   - Use task ID, not full task content
   - Link to app for full details

3. **Rate Limiting:**
   - Resend has built-in rate limits
   - Current implementation handles this gracefully

## Next Steps

Once setup is complete, you can:

1. **Add daily digest emails** - Summary of all tasks due today
2. **Add completion notifications** - Celebrate when tasks are done
3. **Add overdue reminders** - Alert for missed deadlines
4. **Add team notifications** - Share task updates with collaborators

## Support

If you encounter issues:
1. Check this guide's troubleshooting section
2. Review Vercel function logs
3. Check Resend dashboard for delivery status
4. Verify environment variables are set correctly

## Example Flow

```
User creates task:
├─ Due: Tomorrow 2:00 PM
├─ Reminder: 15 minutes before
└─ Email: user@example.com

Server time: Tomorrow 1:44 PM
├─ Cron runs (every minute)
├─ Checks: Is 1:45 PM ≤ now < 1:46 PM?
├─ YES! Send email
├─ Mark email_sent = true
└─ Log success

User receives email at 1:45 PM ✅
```

---

**Questions?** Check the code comments in:
- `src/lib/email/resend.ts` - Email service
- `src/app/api/cron/send-reminders/route.ts` - Cron logic
- `supabase/migrations/add_email_tracking.sql` - Database schema
