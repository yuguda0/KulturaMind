#!/bin/bash
# PythonAnywhere Setup Script for KulturaMind
# Run this script in PythonAnywhere bash console after cloning the repo

set -e

echo "=========================================="
echo "KulturaMind - PythonAnywhere Setup"
echo "=========================================="

# Get username
read -p "Enter your PythonAnywhere username: " USERNAME

# Navigate to home
cd ~

# Clone if not already cloned
if [ ! -d "KulturaMind" ]; then
    echo "Cloning repository..."
    git clone https://github.com/yuguda0/KulturaMind.git
else
    echo "Repository already exists, pulling latest changes..."
    cd KulturaMind
    git pull origin main
    cd ~
fi

# Create virtual environment
echo "Creating virtual environment..."
mkvirtualenv --python=/usr/bin/python3.10 kulturamind

# Install dependencies
echo "Installing dependencies..."
cd ~/KulturaMind/backend
pip install -r requirements.txt

# Create .env file if it doesn't exist
if [ ! -f ".env" ]; then
    echo "Creating .env file..."
    cat > .env << EOF
PYTHONUNBUFFERED=1
# Add your API keys and configuration here
EOF
    echo ".env file created. Please edit it with your configuration."
fi

# Set permissions
echo "Setting permissions..."
chmod -R 755 ~/KulturaMind

echo ""
echo "=========================================="
echo "Setup Complete!"
echo "=========================================="
echo ""
echo "Next steps:"
echo "1. Go to Web tab in PythonAnywhere dashboard"
echo "2. Add a new web app (Manual configuration, Python 3.10)"
echo "3. Set WSGI file to: /home/$USERNAME/KulturaMind/backend/wsgi.py"
echo "4. Set Virtualenv to: /home/$USERNAME/.virtualenvs/kulturamind"
echo "5. Click Reload"
echo ""
echo "Your app will be available at: https://$USERNAME.pythonanywhere.com"
echo ""

