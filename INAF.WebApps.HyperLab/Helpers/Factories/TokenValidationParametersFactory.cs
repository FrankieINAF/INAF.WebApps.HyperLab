using Microsoft.IdentityModel.Tokens;
using System.Security.Cryptography;

namespace INAF.WebApps.HyperLab.Helpers.Factories
{
    public class TokenValidationParametersFactory
    {
        private readonly IConfiguration configuration;

        public TokenValidationParametersFactory(IConfiguration configuration)
        {
            this.configuration = configuration;
        }

        public RsaSecurityKey getRsaSecurityKey()
        {
            var appPrefixForUserSecrets = configuration.GetSection("AppSettings:AppPrefixForUserSecrets").Value;

            RSA rsa = RSA.Create();
            rsa.ImportRSAPublicKey(
                source: Convert.FromBase64String(configuration.GetSection($"{appPrefixForUserSecrets}:JwtToken:PublicKey").Value),
                bytesRead: out int _
            );
            return new RsaSecurityKey(rsa);
        }

        public TokenValidationParameters getTokenValidationParameters()
        {
            var appPrefixForUserSecrets = configuration.GetSection("AppSettings:AppPrefixForUserSecrets").Value;
            string validIssuer = configuration.GetSection($"{appPrefixForUserSecrets}:JwtToken:Issuer").Value;
            string validAudience = configuration.GetSection($"{appPrefixForUserSecrets}:JwtToken:Audience").Value;

            return new TokenValidationParameters
            {
                ValidateIssuer = true,
                ValidIssuer = validIssuer,
                ValidateAudience = true,
                ValidAudience = validAudience,
                ValidateIssuerSigningKey = true,
                RequireExpirationTime = true, // <- JWTs are required to have "exp" property set
                ValidateLifetime = true, // <- the "exp" will be validated
                IssuerSigningKey = getRsaSecurityKey()
            };
        }
    }
}
