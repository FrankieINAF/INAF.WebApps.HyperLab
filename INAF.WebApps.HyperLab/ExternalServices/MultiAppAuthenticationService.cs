using INAF.Libraries.Net.CommonWebAppModels.Models.Account;

namespace INAF.WebApps.HyperLab.ExternalServices
{
    public class MultiAppAuthenticationService
    {
        private readonly HttpClient _httpClient;

        public MultiAppAuthenticationService(HttpClient httpClient)
        {
            _httpClient = httpClient;
        }

        public async Task<bool> RegisterAsync(RegistrationModel model)
        {
            var response = await _httpClient.PostAsJsonAsync($"/api/Account/Register", model);
            if (response.IsSuccessStatusCode)
            {
                var content = await response.Content.ReadAsStringAsync();
                return bool.Parse(content);
            }
            return false;
        }
    }
}
