using INAF.Libraries.Net.CommonWebAppModels.Models;
using INAF.Libraries.Net.CommonWebAppModels.Models.Account;
using INAF.Libraries.Net.CommonWebAppModels.Models.Requests;
using INAF.Libraries.Net.CommonWebAppModels.Models.Responses;
using INAF.Libraries.Net.CommonWebAppModels.Models.Users;
using System.Net;
using System.Text;
using System.Text.Json;
using System.Web;

namespace INAF.WebApps.HyperLab.Helpers
{
    public class AuthorizationHelper
    {
        private readonly int MAX_ATTEMPTS = 3;

        private readonly IServiceProvider serviceProvider;
        private readonly IConfiguration configuration;
        private readonly ILogger<AuthorizationHelper> logger;
        private readonly IHttpClientFactory httpClientFactory;
        private readonly IHttpContextAccessor httpContextAccessor;

        private readonly string appName;
        private readonly string authServiceBaseUrl;

        public AuthorizationHelper(IServiceProvider serviceProvider,
                                   IConfiguration configuration,
                                   ILogger<AuthorizationHelper> logger,
                                   IHttpClientFactory httpClientFactory,
                                   IHttpContextAccessor httpContextAccessor)
        {
            this.serviceProvider = serviceProvider;
            this.configuration = configuration;
            this.logger = logger;
            this.httpClientFactory = httpClientFactory;
            this.httpContextAccessor = httpContextAccessor;

            appName = configuration.GetValue<string>("AppSettings:AuthService:ApplicationName") ?? throw new ArgumentNullException("AppSettings:ApplicationName configuration is missing");
            authServiceBaseUrl = configuration.GetValue<string>("AppSettings:AuthService:BaseUrl") ?? throw new ArgumentNullException("AppSettings:AuthService:BaseUrl configuration is missing");
        }

        public async Task<bool> confirmLoginAsync(int userId, string token)
        {
            try
            {
                var confirmLoginUrl = $"{authServiceBaseUrl}/Account/ConfirmLogin";
                var response = await sendPostRequestAsync<GenericRequestByIdAndTextModel, bool>(confirmLoginUrl, new GenericRequestByIdAndTextModel(userId, token), CancellationToken.None);
                return response;
            }
            catch (Exception ex)
            {
                logger.LogError(ex, $"Error occurred during {nameof(confirmLoginAsync)}.");
                return false;
            }
        }

        public async Task<LoginModel> getLoginFromTokenAsync(string token, CancellationToken cancellationToken = default)
        {
            try
            {
                var getLoginFromTokenUrl = $"{authServiceBaseUrl}/Account/GetLoginFromToken";
                var model = new GenericRequestByTextModel(token);
                var loginModel = await sendGetRequestAsync<GenericRequestByTextModel, LoginModel>(getLoginFromTokenUrl, model, cancellationToken);
                return loginModel ?? new LoginModel();
            }
            catch (Exception ex)
            {
                logger.LogError(ex, $"Error occurred during {nameof(getLoginFromTokenAsync)}.");
                return new LoginModel();
            }
        }

        public async Task<JwtTokenModel?> getTokenForUserAsync(int userId, CancellationToken cancellationToken = default)
        {
            try
            {
                var getTokenUrl = $"{authServiceBaseUrl}/Account/GetTokenForUser";
                var model = new GenericRequestByIdModel { Id = userId };
                var jwtToken = await sendGetRequestAsync<GenericRequestByIdModel, JwtTokenModel>(getTokenUrl, model, cancellationToken);
                System.Diagnostics.Debug.WriteLine($"[AuthorizationHelper] getTokenForUserAsync: Retrieved token {jwtToken.Token}");
                return jwtToken;
            }
            catch (Exception ex)
            {
                logger.LogError(ex, $"Error occurred during {nameof(getTokenForUserAsync)}.");
                return null;
            }
        }

        public async Task<int> getUserIdAsync(CancellationToken cancellationToken = default)
        {
            try
            {
                var getUserIdUrl = $"{authServiceBaseUrl}/Account/GetUserId";
                var response = await sendGetRequestAsync<GenericRequestByIdModel, int>(getUserIdUrl, null, cancellationToken);
                return response;
            }
            catch (Exception ex)
            {
                logger.LogError(ex, $"Error occurred during {nameof(getUserIdAsync)}.");
                return default;
            }
        }

        public async Task<bool> isLoginAlreadyConfirmedAsync(string token, CancellationToken cancellationToken = default)
        {
            var isLoginAlreadyConfirmedUrl = $"{authServiceBaseUrl}/Account/IsLoginAlreadyConfirmed";
            try
            {
                var response = await sendGetRequestAsync<GenericRequestByTextModel, bool>(isLoginAlreadyConfirmedUrl, new GenericRequestByTextModel(token), cancellationToken);
                return response;
            }
            catch (Exception ex)
            {
                logger.LogError(ex, $"Error occurred during {nameof(isLoginAlreadyConfirmedAsync)}.");
                return false;
            }
        }

        public async Task<bool> isUserTokenValid(string userToken)
        {
            try
            {
                var validateTokenUrl = $"{authServiceBaseUrl}/Account/IsUserTokenValid";
                var response = await sendGetRequestAsync<GenericRequestByTextModel, bool>(validateTokenUrl, new GenericRequestByTextModel(userToken));
                return response;
            }
            catch (Exception ex)
            {
                logger.LogError(ex, $"Error occurred during {nameof(isUserTokenValid)}.");
                return false;
            }
        }

        public async Task<UserModel?> loginAsync(JwtLoginModel model,
                                                 CancellationToken cancellationToken = default)
        {
            try
            {
                var loginUrl = $"{authServiceBaseUrl}/Account/Login";
                var response = await sendPostRequestAsync<JwtLoginModel, UserModel>(loginUrl, model, cancellationToken);
                return response;
            }
            catch (Exception ex)
            {
                logger.LogError(ex, $"Error occurred during {nameof(loginAsync)}.");
                return null;
            }
        }

        public async Task<bool> logoutAsync(int userId, CancellationToken cancellationToken = default)
        {
            try
            {
                var logoutUrl = $"{authServiceBaseUrl}/Account/Logout";
                var response = await sendPostRequestAsync<GenericRequestByIdModel, bool>(logoutUrl, new GenericRequestByIdModel(userId), cancellationToken);
                return response;
            }
            catch (Exception ex)
            {
                logger.LogError(ex, $"Error occurred during {nameof(logoutAsync)}.");
                return false;
            }
        }

        public async Task<GenericValueStringResponseModel> passwordResetAsync(PasswordResetModel model,
                                                                              CancellationToken cancellationToken = default)
        {
            try
            {
                var passwordChangeUrl = $"{authServiceBaseUrl}/Account/PasswordReset";
                var response = await sendPostRequestAsync<PasswordResetModel, GenericValueStringResponseModel>(passwordChangeUrl, model, cancellationToken);
                return response ?? new GenericValueStringResponseModel { IsOk = false, Value = "Failed to change password." };
            }
            catch (Exception ex)
            {
                logger.LogError(ex, $"Error occurred during {nameof(passwordResetAsync)}.");
                return new GenericValueStringResponseModel { IsOk = false, Value = "An error occurred while changing password." };
            }
        }

        public async Task<GenericResponseModel> passwordResetExecuteAsync(IncomingLoginConfirmationModel model,
                                                                          CancellationToken cancellationToken = default)
        {
            try
            {
                var passwordResetExecuteUrl = $"{authServiceBaseUrl}/Account/PasswordResetExecute";
                var response = await sendPostRequestAsync<IncomingLoginConfirmationModel, GenericResponseModel>(passwordResetExecuteUrl, model, cancellationToken);
                return response ?? new GenericResponseModel { IsOk = false, ResponseObject = "Failed to execute password reset." };
            }
            catch (Exception ex)
            {
                logger.LogError(ex, $"Error occurred during {nameof(passwordResetExecuteAsync)}.");
                return new GenericResponseModel { IsOk = false, ResponseObject = "An error occurred while executing password reset." };
            }
        }

        public async Task<GenericValueStringResponseModel> passwordResetSendEmailAsync(PasswordResetRequestModel model,
                                                                                       CancellationToken cancellationToken = default)
        {
            try
            {
                var passwordResetSendEmailUrl = $"{authServiceBaseUrl}/Account/PasswordResetSendEmail";
                var response = await sendPostRequestAsync<PasswordResetRequestModel, GenericValueStringResponseModel>(passwordResetSendEmailUrl, model, cancellationToken);
                return response ?? new GenericValueStringResponseModel { IsOk = false, Value = "Failed to send password reset email." };
            }
            catch (Exception ex)
            {
                logger.LogError(ex, $"Error occurred during {nameof(passwordResetSendEmailAsync)}.");
                return new GenericValueStringResponseModel { IsOk = false, Value = "An error occurred while sending password reset email." };
            }
        }

        public async Task<RegistrationStatusResponseModel?> registerAsync(RegistrationModel model,
                                                                          CancellationToken cancellationToken = default)
        {
            try
            {
                var registerUrl = $"{authServiceBaseUrl}/Account/Registration";
                var response = await sendPostRequestAsync<RegistrationModel, RegistrationStatusResponseModel>(registerUrl, model, cancellationToken);
                return response;
            }
            catch (Exception ex)
            {
                logger.LogError(ex, $"Error occurred during {nameof(registerAsync)}.");
                throw;
            }
        }

        #region SEND REQUESTS/MANAGE RESPONSES
        private string buildQueryStringFromModel<T>(T? model = default)
        {
            if (model == null)
                return string.Empty;

            var properties = typeof(T).GetProperties();
            var queryParams = new List<string>();

            foreach (var property in properties)
            {
                var value = property.GetValue(model);
                if (value != null)
                {
                    var valueString = value.ToString();
                    if (!string.IsNullOrEmpty(valueString))
                    {
                        queryParams.Add($"{property.Name}={Uri.EscapeDataString(valueString)}");
                    }
                }
            }

            return string.Join("&", queryParams);
        }

        private async Task<TResponse?> sendGetRequestAsync<TRequest, TResponse>(
            string url,
            TRequest? requestData = default,
            CancellationToken cancellationToken = default)
        {
            TResponse? result = default;

            try
            {
                using var httpClient = httpClientFactory.CreateClient();

                string? queryString = buildQueryStringFromModel(requestData);
                var requestUri = string.IsNullOrEmpty(queryString) ? url : $"{url}?{queryString}";

                httpClient.DefaultRequestHeaders.Add("X-Calling-Application", appName);

                bool continueLoop = true;
                int counter = 0;

                while (continueLoop)
                {
                    var savedToken = httpContextAccessor.HttpContext?.Session.GetString("AuthServiceToken");
                    if (!string.IsNullOrEmpty(savedToken))
                    {
                        httpClient.DefaultRequestHeaders.Add("Authorization", $"Bearer {savedToken}");
                    }

                    logger.LogInformation($"Sending GET request to {requestUri}");

                    var response = await httpClient.GetAsync(requestUri, cancellationToken);

                    if (response.IsSuccessStatusCode)
                    {
                        var responseContent = await response.Content.ReadAsStringAsync(cancellationToken);
                        result = JsonSerializer.Deserialize<TResponse>(responseContent);

                        logger.LogInformation($"GET request to {requestUri} completed successfully");
                        continueLoop = false;
                    }
                    else
                    {
                        logger.LogError($"GET request to {requestUri} failed with status code {response.StatusCode}");

                        /* when receiving 401, then refresh token, otherwise return null */
                        if (response.StatusCode == HttpStatusCode.Unauthorized)
                        {
                            JwtTokenModel? jwtTokenModel = await manageUnauthorizedResponseAsync(response);
                            if (jwtTokenModel == null)
                                continueLoop = false;
                        }
                        else
                            continueLoop = false;
                    }
                }

                counter++;
                if (counter >= MAX_ATTEMPTS)
                    continueLoop = false;
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "Error occurred while sending GET request to {Url}", url);
            }

            return result;
        }

        private async Task<TResponse?> sendPostRequestAsync<TRequest, TResponse>(
            string url,
            TRequest requestData,
            CancellationToken cancellationToken = default)
        {
            TResponse? result = default;

            try
            {
                using var httpClient = httpClientFactory.CreateClient();

                var jsonContent = JsonSerializer.Serialize(requestData);
                var content = new StringContent(jsonContent, Encoding.UTF8, "application/json");

                httpClient.DefaultRequestHeaders.Add("X-Calling-Application", appName);

                bool continueLoop = true;
                int counter = 0;

                while (continueLoop)
                {
                    var savedToken = httpContextAccessor.HttpContext?.Session.GetString("AuthServiceToken");
                    if (!string.IsNullOrEmpty(savedToken))
                    {
                        httpClient.DefaultRequestHeaders.Add("Authorization", $"Bearer {savedToken}");
                    }

                    logger.LogInformation($"Sending POST request to {url}");

                    var response = await httpClient.PostAsync(url, content, cancellationToken);

                    if (response.IsSuccessStatusCode)
                    {
                        var responseContent = await response.Content.ReadAsStringAsync(cancellationToken);
                        result = JsonSerializer.Deserialize<TResponse>(responseContent);

                        logger.LogInformation($"POST request to {url} completed successfully");
                        continueLoop = false;
                    }
                    else
                    {
                        logger.LogError($"POST request to {url} failed with status code {response.StatusCode}");

                        /* when receiving 401, then refresh token, otherwise return null */
                        if (response.StatusCode == HttpStatusCode.Unauthorized)
                        {
                            JwtTokenModel? jwtTokenModel = await manageUnauthorizedResponseAsync(response);
                            if (jwtTokenModel == null)
                                continueLoop = false;
                        }
                        else
                            continueLoop = false;
                    }

                    counter++;
                    if (counter >= MAX_ATTEMPTS)
                        continueLoop = false;
                }
            }
            catch (Exception ex)
            {
                logger.LogError(ex, $"Error occurred while sending POST request to {url}");
            }

            return result;
        }

        private async Task<JwtTokenModel?> manageUnauthorizedResponseAsync(HttpResponseMessage? response)
        {
            if (response == null || response.StatusCode != HttpStatusCode.Unauthorized)
                return default;

            var unauthorizedContent = await response.Content.ReadAsStringAsync();
            var errorResponse = JsonSerializer.Deserialize<ErrorResponseModel>(unauthorizedContent);

            JwtTokenModel? jwtToken = null;

            try
            {
                if (errorResponse != null)
                {
                    string? error = errorResponse.Error;
                    bool requiresNewToken = errorResponse.RequiresNewToken;

                    if (requiresNewToken)
                    {
                        logger.LogInformation("Unauthorized response requires new token. Attempting to get token for web app.");

                        var getTokenUrl = $"{authServiceBaseUrl}/Account/GetTokenForWebApp";
                        var model = new GenericRequestByTextModel { Text = appName };
                        jwtToken = await sendGetRequestAsync<GenericRequestByTextModel, JwtTokenModel>(getTokenUrl, model);

                        if (jwtToken != null && jwtToken.IsAuthenticated && !string.IsNullOrEmpty(jwtToken.Token))
                        {
                            logger.LogInformation("Successfully obtained new token. Retrying Login.");

                            httpContextAccessor.HttpContext?.Session.SetString("AuthServiceToken", jwtToken.Token);
                        }
                        else
                        {
                            logger.LogError("Failed to obtain new token for web app.");
                        }
                    }
                }
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "Error occurred while managing unauthorized response.");
            }

            return jwtToken;
        }
        #endregion
    }
}
