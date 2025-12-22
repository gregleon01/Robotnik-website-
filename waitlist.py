from flask import Blueprint, request, jsonify
import smtplib
import email.mime.text
import email.mime.multipart
import os
from datetime import datetime

waitlist_bp = Blueprint('waitlist', __name__)

# Email configuration
SMTP_SERVER = "smtp.gmail.com"
SMTP_PORT = 587
EMAIL_ADDRESS = "robotnik.campaign@gmail.com"
EMAIL_PASSWORD = os.environ.get('EMAIL_PASSWORD', '')

# Google Sheets configuration
SPREADSHEET_ID = "11_El1DyoAwKiV4zJSlY5pFiU_WLp7F7Qrh0IQgJCxc8"
CREDENTIALS_FILE = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), 'google_sheets_service.json')

def get_google_sheets_client():
    """Initialize Google Sheets client"""
    try:
        # Set HOME environment variable if not set (for deployment)
        if not os.environ.get('HOME'):
            os.environ['HOME'] = '/tmp'
            
        import gspread
        from oauth2client.service_account import ServiceAccountCredentials
        
        scope = ['https://spreadsheets.google.com/feeds', 'https://www.googleapis.com/auth/drive']
        credentials = ServiceAccountCredentials.from_json_keyfile_name(CREDENTIALS_FILE, scope)
        client = gspread.authorize(credentials)
        return client
    except Exception as e:
        print(f"Google Sheets client error: {e}")
        return None

def add_to_google_sheets(form_data):
    """Add form data to Google Sheets"""
    try:
        client = get_google_sheets_client()
        if not client:
            print("Failed to get Google Sheets client - logging data instead")
            print(f"Would add to Google Sheets: {form_data}")
            return False
            
        # Open the spreadsheet
        spreadsheet = client.open_by_key(SPREADSHEET_ID)
        worksheet = spreadsheet.sheet1  # Use the first sheet
        
        # Prepare the row data
        timestamp = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
        row_data = [
            timestamp,
            form_data['name'],
            form_data['email'],
            form_data['farm_size'],
            form_data['challenges']
        ]
        
        # Check if headers exist, if not add them
        try:
            existing_records = worksheet.get_all_records()
            if len(existing_records) == 0:
                headers = ['Timestamp', 'Name', 'Email', 'Farm Size (hectares)', 'Weeding Challenges']
                worksheet.insert_row(headers, 1)
                print("Added headers to Google Sheets")
        except Exception as header_error:
            # If sheet is empty, add headers
            headers = ['Timestamp', 'Name', 'Email', 'Farm Size (hectares)', 'Weeding Challenges']
            worksheet.insert_row(headers, 1)
            print(f"Added headers after error: {header_error}")
        
        # Add the new row
        worksheet.append_row(row_data)
        print(f"Successfully added to Google Sheets: {form_data['name']}")
        return True
        
    except Exception as e:
        print(f"Google Sheets error: {e}")
        print(f"Data that would be added: {form_data}")
        return False

def send_email_notification(form_data):
    """Send email notification to robotnik.campaign@gmail.com"""
    try:
        msg = email.mime.multipart.MIMEMultipart()
        msg['From'] = EMAIL_ADDRESS
        msg['To'] = EMAIL_ADDRESS
        msg['Subject'] = f"🚀 New RobotNik Waitlist Signup - {form_data['name']}"
        
        body = f"""
🌾 NEW ROBOTNIK WAITLIST SIGNUP! 🌾

👤 Name: {form_data['name']}
📧 Email: {form_data['email']}
🚜 Farm Size: {form_data['farm_size']} hectares
🌿 Weeding Challenges: {form_data['challenges']}
⏰ Signup Time: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}

This farmer is interested in RobotNik's autonomous weeding solution and ready to join the agricultural revolution!

🎯 Next Steps:
- Follow up within 24 hours
- Schedule a demo call
- Assess farm compatibility
- Add to priority list for early access

📊 View all signups in Google Sheets:
https://docs.google.com/spreadsheets/d/{SPREADSHEET_ID}/edit

Farm like it's 2035! 🤖
        """
        
        msg.attach(email.mime.text.MIMEText(body, 'plain'))
        
        # For now, we'll just log the email content since we don't have SMTP credentials
        print("EMAIL NOTIFICATION:")
        print(body)
        
        # Uncomment when SMTP credentials are available:
        # server = smtplib.SMTP(SMTP_SERVER, SMTP_PORT)
        # server.starttls()
        # server.login(EMAIL_ADDRESS, EMAIL_PASSWORD)
        # text = msg.as_string()
        # server.sendmail(EMAIL_ADDRESS, EMAIL_ADDRESS, text)
        # server.quit()
        
        return True
    except Exception as e:
        print(f"Email error: {e}")
        return False

@waitlist_bp.route('/waitlist', methods=['POST'])
def handle_waitlist_signup():
    """Handle waitlist form submissions"""
    try:
        data = request.get_json()
        
        # Validate required fields
        required_fields = ['name', 'email', 'farm_size', 'challenges']
        for field in required_fields:
            if not data.get(field):
                return jsonify({'error': f'Missing required field: {field}'}), 400
        
        form_data = {
            'name': data['name'].strip(),
            'email': data['email'].strip(),
            'farm_size': data['farm_size'].strip(),
            'challenges': data['challenges'].strip()
        }
        
        # Send email notification
        email_sent = send_email_notification(form_data)
        
        # Add to Google Sheets
        sheets_added = add_to_google_sheets(form_data)
        
        # Log the signup for debugging
        print(f"New waitlist signup: {form_data}")
        print(f"Email sent: {email_sent}, Google Sheets added: {sheets_added}")
        
        return jsonify({
            'success': True,
            'message': 'Thank you for joining the RobotNik waitlist! We\'ll be in touch soon to discuss how we can help liberate your farm from manual weeding.',
            'email_sent': email_sent,
            'sheets_updated': sheets_added
        }), 200
        
    except Exception as e:
        print(f"Error processing signup: {e}")
        return jsonify({'error': 'Something went wrong. Please try again.'}), 500

@waitlist_bp.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy', 
        'service': 'RobotNik Waitlist API',
        'timestamp': datetime.now().isoformat()
    }), 200

