import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.SMTP_EMAIL,
    pass: process.env.SMTP_PASSWORD,
  },
});

export async function sendSignupAdminNotification(ownerEmail: string, ownerPhone: string) {
  if (!process.env.SMTP_EMAIL) return; // Skip if no SMTP configured
  
  await transporter.sendMail({
    from: `"CSUNHousing Admin" <${process.env.SMTP_EMAIL}>`,
    to: process.env.SMTP_EMAIL, // Send to Admin
    subject: `New Property Owner Signup Request: ${ownerEmail}`,
    html: `
      <h2>New Signup Request</h2>
      <p>A new property owner has submitted an application to join CSUNHousing.</p>
      <ul>
        <li><strong>Email:</strong> ${ownerEmail}</li>
        <li><strong>Phone:</strong> ${ownerPhone}</li>
      </ul>
      <p>Please log in to the Admin Console to review and approve their request.</p>
      <br />
      <a href="${process.env.NEXTAUTH_URL}/admin">Go to Admin Console</a>
    `,
  });
}

export async function sendApprovalOwnerNotification(ownerEmail: string) {
  if (!process.env.SMTP_EMAIL) return;

  await transporter.sendMail({
    from: `"CSUNHousing Admin" <${process.env.SMTP_EMAIL}>`,
    to: ownerEmail,
    subject: `Your CSUNHousing Application has been Approved!`,
    html: `
      <h2>Welcome to CSUNHousing!</h2>
      <p>Your application to list properties on our platform has been officially approved by the administrator.</p>
      <p>You can now log in using the password you created during signup.</p>
      <br />
      <a href="${process.env.NEXTAUTH_URL}/auth/login">Login to your Owner Dashboard</a>
    `,
  });
}

export async function sendNewBookingOwnerNotification(
  ownerEmail: string,
  studentName: string,
  studentEmail: string,
  studentPhone: string,
  budget: string,
  requirements: string,
  propertyName: string
) {
  if (!process.env.SMTP_EMAIL) return;

  await transporter.sendMail({
    from: `"CSUNHousing Notifications" <${process.env.SMTP_EMAIL}>`,
    to: ownerEmail,
    subject: `New Booking Request for ${propertyName}`,
    html: `
      <h2>New Student Booking Request</h2>
      <p>You have received a new lease request for: <strong>${propertyName}</strong></p>
      <h3>Student Details:</h3>
      <ul>
        <li><strong>Name:</strong> ${studentName}</li>
        <li><strong>Email:</strong> ${studentEmail}</li>
        <li><strong>Phone:</strong> ${studentPhone}</li>
        <li><strong>Budget:</strong> ${budget || 'Not specified'}</li>
      </ul>
      <h3>Requirements/Message:</h3>
      <p>${requirements || 'No specific requirements added.'}</p>
      <br />
      <p>Please log in to your Owner Dashboard to view more details and reach out to the student.</p>
      <a href="${process.env.NEXTAUTH_URL}/dashboard">Go to Owner Dashboard</a>
    `,
  });
}

export async function sendBookingAcknowledgedNotification(
  studentEmail: string,
  propertyName: string,
  ownerEmail: string
) {
  if (!process.env.SMTP_EMAIL) return;

  await transporter.sendMail({
    from: `"CSUNHousing Notifications" <${process.env.SMTP_EMAIL}>`,
    to: studentEmail,
    subject: `Your Viewing Request for ${propertyName} has been Acknowledged!`,
    html: `
      <h2>Request Acknowledged</h2>
      <p>The owner of <strong>${propertyName}</strong> has acknowledged your viewing request.</p>
      <p>They will be reaching out to you shortly to coordinate further details.</p>
      <p>If you need to contact them directly, their email is: <strong>${ownerEmail}</strong></p>
      <br />
      <p>Best regards,<br/>The CSUNHousing Team</p>
    `,
  });
}
