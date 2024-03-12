using Microsoft.IdentityModel.Tokens;
using System.Security.Cryptography;
using System.Text;

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
            RSA rsa = RSA.Create();
            rsa.ImportRSAPublicKey(
                source: Convert.FromBase64String(configuration.GetSection("AppSettings:JwtToken:PublicKey").Value),
                bytesRead: out int _
            );
            return new RsaSecurityKey(rsa);
        }

        public TokenValidationParameters getTokenValidationParameters()
        {
            string validIssuer = configuration.GetSection("AppSettings:JwtToken:Issuer").Value;
            string validAudience = configuration.GetSection("AppSettings:JwtToken:Audience").Value;

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
