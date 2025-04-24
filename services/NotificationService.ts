import { SecurityIncident } from '../types';

class NotificationService {
  private static instance: NotificationService;
  private adminEmail: string = 'admin@campusync.com';
  private adminPhone: string = '+1234567890'; // Replace with actual admin phone number

  private constructor() {}

  public static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService();
    }
    return NotificationService.instance;
  }

  public async sendEmailNotification(incident: SecurityIncident) {
    try {
      // In a real app, this would use an email service like SendGrid or AWS SES
      console.log('Sending email notification to:', this.adminEmail);
      console.log('Subject: Security Alert - Suspicious Vehicle Detected');
      console.log('Content:', this.generateEmailContent(incident));
      
      // Simulate email sending
      await new Promise(resolve => setTimeout(resolve, 1000));
      console.log('Email notification sent successfully');
    } catch (error) {
      console.error('Error sending email notification:', error);
    }
  }

  public async sendSMSNotification(incident: SecurityIncident) {
    try {
      // In a real app, this would use an SMS service like Twilio
      console.log('Sending SMS notification to:', this.adminPhone);
      console.log('Message:', this.generateSMSContent(incident));
      
      // Simulate SMS sending
      await new Promise(resolve => setTimeout(resolve, 1000));
      console.log('SMS notification sent successfully');
    } catch (error) {
      console.error('Error sending SMS notification:', error);
    }
  }

  private generateEmailContent(incident: SecurityIncident): string {
    return `
      Security Alert - Suspicious Vehicle Detected

      Incident Details:
      - Type: ${incident.type}
      - Location: ${incident.location.zone}
      - Severity: ${incident.severity}
      - Time: ${new Date(incident.timestamp).toLocaleString()}
      - Description: ${incident.description}

      Please take immediate action to investigate this incident.

      Best regards,
      Campus Security System
    `;
  }

  private generateSMSContent(incident: SecurityIncident): string {
    return `ALERT: ${incident.type.toUpperCase()} detected at ${incident.location.zone}. Severity: ${incident.severity}. Please check dashboard for details.`;
  }
}

export default NotificationService; 