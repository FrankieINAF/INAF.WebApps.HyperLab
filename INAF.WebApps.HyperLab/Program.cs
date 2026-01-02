using INAF.Libraries.Net.CommonWebAppHelpers;
using INAF.Libraries.Net.DB.HyperLabData;
using INAF.Libraries.Net.DB.HyperLabUsers;
using INAF.Libraries.Net.HyperLab.CommonHelpers;
using INAF.Libraries.Net.HyperLab.CommonWebAppHelpers;
using INAF.Libraries.Net.HyperLabCommonHelpers;
using INAF.Libraries.Net.HyperLabCommonHelpers.ProcessingHelpers;
using INAF.Libraries.Net.Math.Fit.Linear;
using INAF.Libraries.Net.Math.Fit.Spline;
using INAF.WebApps.HyperLab.Attributes;
using INAF.WebApps.HyperLab.Controllers;
using INAF.WebApps.HyperLab.Helpers;
using INAF.WebApps.HyperLab.Helpers.Factories;
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.HttpOverrides;
using Microsoft.Extensions.FileProviders;
using Microsoft.IdentityModel.Tokens;
using Microsoft.Net.Http.Headers;
using System.Text.Json.Serialization;
using SameSiteMode = Microsoft.AspNetCore.Http.SameSiteMode;

var builder = WebApplication.CreateBuilder(args);

var config = builder.Configuration;
string? validIssuer = config.GetSection("AppSettings:JwtToken:Issuer").Value;
string? validAudience = config.GetSection("AppSettings:JwtToken:Audience").Value;

RsaSecurityKey rsaSecurityKey = (new TokenValidationParametersHelper(config)).getRsaSecurityKey();
builder.Services.AddSingleton<RsaSecurityKey>(rsaSecurityKey);


// Add services to the container.
builder.Services.AddControllersWithViews()
    .AddJsonOptions(x =>
    {
        x.JsonSerializerOptions.PropertyNamingPolicy = null; // to avoid camel case when creating json from objects
        x.JsonSerializerOptions.DefaultIgnoreCondition = JsonIgnoreCondition.WhenWritingNull; // to avoid transmitting null values in json response
    });

builder.Services.AddHttpContextAccessor(); // to access HttpContext from everywhere

string loginPath = $"/{GenericHelper.GetControllerName(nameof(AccountController)) }/{nameof(AccountController.Login)}";
builder.Services.AddAuthentication(options =>
    {
        options.DefaultScheme = "JWT_OR_COOKIE";
        options.DefaultChallengeScheme = "JWT_OR_COOKIE";
    })
    .AddCookie(options =>
    {
        options.Cookie.Name = INAF.WebApps.HyperLab.Values.Constants.HYPERLAB_WEB_APP_COOKIES;
        options.LoginPath = new PathString(loginPath);
        options.LogoutPath = new PathString(loginPath);
        options.AccessDeniedPath = new PathString(loginPath);
        options.SlidingExpiration = true; // the cookie would be re-issued on any request half way through the ExpireTimeSpan
        options.ExpireTimeSpan = TimeSpan.FromDays(30);
    })
    .AddJwtBearer(options =>
    {
        options.IncludeErrorDetails = true; // <- great for debugging
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidIssuer = validIssuer,
            ValidateAudience = true,
            ValidAudience = validAudience,
            ValidateIssuerSigningKey = true,
            RequireExpirationTime = true,
            ValidateLifetime = true,
            IssuerSigningKey = rsaSecurityKey
        };
    })
    .AddPolicyScheme("JWT_OR_COOKIE", "JWT_OR_COOKIE", options =>
    {
        options.ForwardDefaultSelector = context =>
        {
            string? authorization = context.Request.Headers[HeaderNames.Authorization];
            if (!string.IsNullOrEmpty(authorization) && authorization.StartsWith("Bearer "))
                return JwtBearerDefaults.AuthenticationScheme;

            return CookieAuthenticationDefaults.AuthenticationScheme;
        };
    });

builder.Services.AddServerSideBlazor()
    .AddCircuitOptions(options => options.DetailedErrors = true)
    .AddHubOptions(options => options.MaximumReceiveMessageSize = 1024 * 1024);

/* configure IIS options (disable automatic authentication end use the one defined in current project) */
builder.Services.Configure<IISServerOptions>(options =>
{
    options.AutomaticAuthentication = false;
});

builder.Services.ConfigureHttpJsonOptions(options => options.SerializerOptions.PropertyNamingPolicy = null);

/* COOKIE POLICY */
builder.Services.Configure<CookiePolicyOptions>(options =>
{
    // This lambda determines whether user consent for non-essential 
    // cookies is needed for a given request.
    options.CheckConsentNeeded = context => true;

    options.MinimumSameSitePolicy = SameSiteMode.None;
});

/* SESSION */
builder.Services.AddDistributedMemoryCache();

builder.Services.AddSession(options =>
{
    options.IdleTimeout = TimeSpan.FromMinutes(30); // Set the timeout for the session
    options.Cookie.HttpOnly = true; // against XSS (Cross-Site Scripting) attacks
    options.Cookie.IsEssential = true;

    if (builder.Environment.IsDevelopment())
        options.Cookie.SecurePolicy = CookieSecurePolicy.None;
    else
        options.Cookie.SecurePolicy = CookieSecurePolicy.Always;

    options.Cookie.SameSite = SameSiteMode.Lax;
});

/* SERVICES */
builder.Services
    /* ATTRIBUTES */
    .AddScoped<CheckIsLoginValidAttribute>()

    /* SCOPED SERVICES */
    .AddScoped<DbHandlerHyperLabData>()
    .AddScoped<DbHandlerHyperLabUsers>()
    .AddScoped<ChartsHelper>()

    /* TRANSIENT SERVICES */
    .AddTransient<AuthorizationHelper>()
    .AddTransient<ConnectionStringBuilder>()
    .AddTransient<ContinuumRemovalHelper>()
    .AddTransient<EncryptionHelper>()
    .AddTransient<FitMethodsHelper>()
    .AddTransient<LinearFitHelper>()
    .AddTransient<LinearProcessingHelper>()
    .AddTransient<MenuHelper>()
    .AddTransient<MissingPointHelper>()
    .AddTransient<PMinPMaxHelper>()
    .AddTransient<SampleTypesHelper>()
    .AddTransient<SearchByMaterialHelper>()
    .AddTransient<SplineFitHelper>()
    .AddTransient<SplineProcessingHelper>()
    .AddTransient<TokenValidationHelper>()
    .AddTransient<TokenValidationParametersHelper>()
    .AddTransient<UsersFactory>();

builder.Services.AddHttpClient();

/* logging */
builder.Logging.ClearProviders();
builder.Logging.AddConsole();
var loggingOptions = builder.Configuration.GetSection("AppSettings:Log4NetCore").Get<Log4NetProviderOptions>();
builder.Logging.AddLog4Net(loggingOptions);

/* add Swagger */
//builder.Services.AddSwaggerGen();

var app = builder.Build();

app.UseExceptionHandler("/Home/Error");
if (app.Environment.IsDevelopment())
{
    app.UseWebAssemblyDebugging();

    //    app.UseSwagger();
    //    app.UseSwaggerUI(options =>
    //    {
    //        options.SwaggerEndpoint("/swagger/v1/swagger.json", "v1");
    //        options.RoutePrefix = string.Empty;
    //    });
}
else
{
    // Configure the HTTP request pipeline.
    //app.UseExceptionHandler("/Home/Error");
    // The default HSTS value is 30 days. You may want to change this for production scenarios, see https://aka.ms/aspnetcore-hsts.
    app.UseHsts();
}

/* supported cultures */
var supportedCultures = new[] { "en" };
var localizationOptions = new RequestLocalizationOptions().SetDefaultCulture(supportedCultures[0])
    .AddSupportedCultures(supportedCultures)
    .AddSupportedUICultures(supportedCultures);
app.UseRequestLocalization(localizationOptions);

//app.UseHttpsRedirection();
app.UseBlazorFrameworkFiles();
app.MapStaticAssets();
app.UseCookiePolicy();


app.UseRouting();

app.UseForwardedHeaders(new ForwardedHeadersOptions
{
    ForwardedHeaders = ForwardedHeaders.XForwardedFor | ForwardedHeaders.XForwardedProto
});
app.UseAuthentication();
app.UseAuthorization();

app.UseSession();

app.UseStaticFiles(new StaticFileOptions
{
    FileProvider = new PhysicalFileProvider(Path.Combine(Directory.GetCurrentDirectory(), ".well-known", "acme-challenge")),
    RequestPath = "/.well-known/acme-challenge",
    ServeUnknownFileTypes = true // Permette di servire file senza estensione
});

app.MapControllerRoute(
    name: "default",
    pattern: "{controller=Home}/{action=Index}/{id?}")
    .WithStaticAssets();
app.MapBlazorHub();

app.Run();
