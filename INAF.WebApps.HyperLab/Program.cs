using INAF.Libraries.Net.CommonWebAppHelpers;
using INAF.Libraries.Net.SLabDbLibrary;
using INAF.Libraries.NetStandard.Math.Fit.Linear;
using INAF.Libraries.NetStandard.Math.Fit.Spline;
using INAF.Libraries.NetStandard.SLabCommonHelpers;
using INAF.Libraries.NetStandard.SLabCommonHelpers.ProcessingHelpers;
using INAF.WebApps.HyperLab.Attributes;
using INAF.WebApps.HyperLab.Helpers.Factories;
using INAF.WebApps.HyperLab.Helpers;
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.HttpOverrides;
using Microsoft.IdentityModel.Tokens;
using Microsoft.Net.Http.Headers;
using System.Text.Json.Serialization;

var builder = WebApplication.CreateBuilder(args);

var config = builder.Configuration;
string validIssuer = config.GetSection("AppSettings:JwtToken:Issuer").Value;
string validAudience = config.GetSection("AppSettings:JwtToken:Audience").Value;

RsaSecurityKey rsaSecurityKey = (new TokenValidationParametersFactory(config)).getRsaSecurityKey();
builder.Services.AddSingleton<RsaSecurityKey>(rsaSecurityKey);


// Add services to the container.
builder.Services.AddControllersWithViews()
    .AddJsonOptions(x =>
    {
        x.JsonSerializerOptions.PropertyNamingPolicy = null; // to avoid camel case when creating json from objects
        x.JsonSerializerOptions.DefaultIgnoreCondition = JsonIgnoreCondition.WhenWritingNull; // to avoid transmitting null values in json response
    });

builder.Services.AddHttpContextAccessor(); // to access HttpContext from everywhere

builder.Services.AddAuthentication(options =>
{
    options.DefaultScheme = "JWT_OR_COOKIE";
    options.DefaultChallengeScheme = "JWT_OR_COOKIE";
})
    .AddCookie(options =>
    {
        options.Cookie.Name = "SlabWebAppCookies";
        options.LoginPath = new PathString("/Account/Login");
        options.LogoutPath = new PathString("/Account/Login");
        options.AccessDeniedPath = new PathString("/Account/Login");
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
            string authorization = context.Request.Headers[HeaderNames.Authorization];
            if (!string.IsNullOrEmpty(authorization) && authorization.StartsWith("Bearer "))
                return JwtBearerDefaults.AuthenticationScheme;

            return CookieAuthenticationDefaults.AuthenticationScheme;
        };
    });

builder.Services.AddServerSideBlazor()
                    .AddHubOptions(options => options.MaximumReceiveMessageSize = 1024 * 1024);

/* configure IIS options (disable automatic authentication end use the one defined in current project) */
builder.Services.Configure<IISServerOptions>(options =>
{
    options.AutomaticAuthentication = false;
});

builder.Services.ConfigureHttpJsonOptions(options => options.SerializerOptions.PropertyNamingPolicy = null);


/* SESSION */
builder.Services.AddDistributedMemoryCache();

builder.Services.AddSession(options =>
{
    options.Cookie.IsEssential = true;
});

/* SERVICES */
builder.Services
    /* ATTRIBUTES */
    .AddScoped<CheckIsLoginValidAttribute>()

    /* SCOPED SERVICES */
    .AddScoped<DbHandler>()
    .AddScoped<ChartsHelper>()

    /* TRANSIENT SERVICES */
    .AddTransient<ContinuumRemovalHelper>()
    .AddTransient<EncryptionHelper>()
    .AddTransient<LinearFitHelper>()
    .AddTransient<LinearProcessingHelper>()
    .AddTransient<MenuHelper>()
    .AddTransient<MissingPointHelper>()
    .AddTransient<SampleTypesHelper>()
    .AddTransient<SearchByMaterialHelper>()
    .AddTransient<SplineFitHelper>()
    .AddTransient<SplineProcessingHelper>()
    .AddTransient<TokenValidationParametersFactory>()
    .AddTransient<UsersFactory>();

/* logging */
builder.Logging.ClearProviders();
builder.Logging.AddConsole();
var loggingOptions = builder.Configuration.GetSection("AppSettings:Log4NetCore").Get<Log4NetProviderOptions>();
builder.Logging.AddLog4Net(loggingOptions);

/* add Swagger */
//builder.Services.AddSwaggerGen();

var app = builder.Build();

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

// Configure the HTTP request pipeline.
if (!app.Environment.IsDevelopment())
{
    app.UseExceptionHandler("/Home/Error");
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
app.UseStaticFiles();


app.UseRouting();

app.UseForwardedHeaders(new ForwardedHeadersOptions
{
    ForwardedHeaders = ForwardedHeaders.XForwardedFor | ForwardedHeaders.XForwardedProto
});
app.UseAuthentication();
app.UseAuthorization();

app.UseSession();

app.MapControllerRoute(
    name: "default",
    pattern: "{controller=Searches}/{action=Search}/{id?}");
app.MapBlazorHub();

app.Run();
