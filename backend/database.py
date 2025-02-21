import psycopg2

# Database connection settings
DB_NAME = "phishing_db"
DB_USER = "postgres"
DB_PASSWORD = "vento@123"
DB_HOST = "localhost"
DB_PORT = "5432"

# Establish connection
def get_connection():
    return psycopg2.connect(
        database=DB_NAME, 
        user=DB_USER, 
        password=DB_PASSWORD, 
        host=DB_HOST, 
        port=DB_PORT
    )

# Save email data to DB
def save_to_db(sender, receiver, date, subject, body, label, urls):
    conn = get_connection()
    cursor = conn.cursor()
    
    insert_query = """
INSERT INTO phishing_emails (sender, receiver, date, subject, body, label, urls)
VALUES (%s, %s, %s, %s, %s, %s, %s)
"""
    
    cursor.execute(insert_query, (sender, receiver, date, subject, body, label, urls))
    conn.commit()
    
    cursor.close()
    conn.close()

# Fetch emails (example function)
def fetch_all_emails():
    conn = get_connection()
    cursor = conn.cursor()
    
    cursor.execute("SELECT * FROM emails;")
    results = cursor.fetchall()
    
    cursor.close()
    conn.close()
    
    return results
