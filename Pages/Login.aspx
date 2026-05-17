<%@ Page Language="C#" AutoEventWireup="true" CodeBehind="Login.aspx.cs" Inherits="WebAdminDashboard.Login" %>

<!DOCTYPE html>
<html xmlns="http://www.w3.org/1999/xhtml">
<head runat="server">
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Login - Admin Dashboard</title>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css" />
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: "Lato", sans-serif;
            background-color: #ffffff;
            display: flex;
            justify-content: center;
            align-items: center;
            min-height: 100vh;
            color: #222831;
        }

        .login-container {
            background-color: #f5f5f0;
            border-radius: 8px;
            box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
            overflow: hidden;
            width: 400px;
            max-width: 90%;
            border: 1px solid #e0e0e0;
        }

        .login-header {
            background-color: #f5f5f0;
            color: #222831;
            padding: 30px;
            text-align: center;
            border-bottom: 1px solid #e0e0e0;
        }

        .login-header i {
            font-size: 40px;
            margin-bottom: 10px;
            color: #393e46;
        }

        .login-header h2 {
            font-size: 22px;
            font-weight: 600;
            margin-top: 10px;
            color: #222831;
        }

        .login-header p {
            color: #666;
            font-size: 14px;
            margin-top: 5px;
        }

        .login-body {
            padding: 30px;
            background-color: #ffffff;
        }

        .form-group {
            margin-bottom: 20px;
        }

        .form-group label {
            display: block;
            margin-bottom: 8px;
            color: #222831;
            font-weight: 500;
            font-size: 14px;
        }

        .form-group label i {
            margin-right: 8px;
            color: #393e46;
        }

        .input-wrapper {
            position: relative;
        }

        .input-wrapper input {
            width: 100%;
            padding: 12px 40px 12px 12px;
            border: 1px solid #ddd;
            border-radius: 4px;
            font-size: 14px;
            transition: all 0.3s ease;
            background-color: #fafafa;
        }

        .input-wrapper input:focus {
            outline: none;
            border-color: #0092ca;
            background-color: #ffffff;
        }

        .input-wrapper .input-icon {
            position: absolute;
            right: 12px;
            top: 50%;
            transform: translateY(-50%);
            color: #999;
        }

        .error-message {
            color: #dc3545;
            font-size: 13px;
            margin-top: 10px;
            display: none;
            padding: 10px;
            background-color: #ffe6e6;
            border-radius: 4px;
            border: 1px solid #ffcccc;
        }

        .error-message i {
            margin-right: 5px;
        }

        .error-message.show {
            display: block;
        }

        .btn-login {
            width: 100%;
            padding: 12px;
            background-color: #0092ca;
            color: #ffffff;
            border: none;
            border-radius: 4px;
            font-size: 15px;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.2s ease;
            margin-top: 10px;
        }

        .btn-login:hover {
            background-color: #007ba7;
        }

        .btn-login:active {
            transform: scale(0.98);
        }

        .btn-login:disabled {
            background-color: #ccc;
            cursor: not-allowed;
        }

        .login-footer {
            padding: 15px 30px;
            background-color: #f5f5f0;
            text-align: center;
            font-size: 12px;
            color: #999;
            border-top: 1px solid #e0e0e0;
        }

        @media (max-width: 480px) {
            .login-container {
                width: 100%;
                border-radius: 0;
            }
        }
    </style>
</head>
<body>
    <form id="form1" runat="server">
        <div class="login-container">
            <div class="login-header">
                <i class="fas fa-user-shield"></i>
                <h2>Admin Dashboard</h2>
                <p>Autentificare</p>
            </div>

            <div class="login-body">
                <div class="form-group">
                    <label for="txtUsername">
                        <i class="fas fa-user"></i>Nume Utilizator
                    </label>
                    <div class="input-wrapper">
                        <asp:TextBox 
                            ID="txtUsername" 
                            runat="server" 
                            placeholder="Introduceți numele de utilizator"
                            AutoComplete="username">
                        </asp:TextBox>
                        <i class="fas fa-user input-icon"></i>
                    </div>
                </div>

                <div class="form-group">
                    <label for="txtPassword">
                        <i class="fas fa-lock"></i>Parolă
                    </label>
                    <div class="input-wrapper">
                        <asp:TextBox 
                            ID="txtPassword" 
                            runat="server" 
                            TextMode="Password" 
                            placeholder="Introduceți parola"
                            AutoComplete="current-password">
                        </asp:TextBox>
                        <i class="fas fa-lock input-icon"></i>
                    </div>
                </div>

                <div id="errorMessage" class="error-message">
                    <i class="fas fa-exclamation-circle"></i>
                    <span id="errorText"></span>
                </div>

                <asp:Button 
                    ID="btnLogin" 
                    runat="server" 
                    Text="Autentificare" 
                    CssClass="btn-login" 
                    OnClick="btnLogin_Click" />
            </div>

            <div class="login-footer">
                <i class="fas fa-shield-alt"></i> Zona securizată - Acces restricționat
            </div>
        </div>
    </form>

    <script>
        document.addEventListener('DOMContentLoaded', function() {
            const form = document.getElementById('form1');
            const username = document.getElementById('<%= txtUsername.ClientID %>');
            const password = document.getElementById('<%= txtPassword.ClientID %>');

            if (username && password) {
                username.addEventListener('keypress', function(e) {
                    if (e.key === 'Enter') {
                        e.preventDefault();
                        password.focus();
                    }
                });

                password.addEventListener('keypress', function(e) {
                    if (e.key === 'Enter') {
                        e.preventDefault();
                        form.submit();
                    }
                });
            }

            <% if (!string.IsNullOrEmpty(ErrorMessage)) { %>
                const errorMessage = document.getElementById('errorMessage');
                const errorText = document.getElementById('errorText');
                if (errorMessage && errorText) {
                    errorText.textContent = '<%= ErrorMessage %>';
                    errorMessage.classList.add('show');
                }
            <% } %>
        });
    </script>
</body>
</html>
