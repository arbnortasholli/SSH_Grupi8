using AutoKosova.Business.Services;
using AutoKosova.DataAccess;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using System.Text;
using AutoKosova.Api.Authorization;
using AutoKosova.Api.BackgroundJobs;
using AutoKosova.Api.Swagger;
using AutoKosova.Business.Interfaces;
using Microsoft.AspNetCore.Authorization;

var builder = WebApplication.CreateBuilder(args);

// Controllers
builder.Services.AddControllers();

// Swagger
builder.Services.AddEndpointsApiExplorer();

builder.Services.AddSwaggerGen(options =>
{
    options.SwaggerDoc("v1", new OpenApiInfo
    {
        Title = "AutoKosova API",
        Version = "v1",
        Description = "API per menaxhimin e veturave, qirave, pagesave, perdoruesve, roleve, lejeve dhe tenant requests."
    });

    options.OperationFilter<SwaggerDefaultOperationFilter>();

    options.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        Name = "Authorization",
        Description = "Vendose JWT token-in kështu: Bearer {token}",
        In = ParameterLocation.Header,
        Type = SecuritySchemeType.ApiKey,
        Scheme = "Bearer"
    });

    options.AddSecurityRequirement(new OpenApiSecurityRequirement
    {
        {
            new OpenApiSecurityScheme
            {
                Name = "Bearer",
                In = ParameterLocation.Header,
                Reference = new OpenApiReference
                {
                    Id = "Bearer",
                    Type = ReferenceType.SecurityScheme
                }
            },
            Array.Empty<string>()
        }
    });
});

// Database
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseSqlServer(
        builder.Configuration.GetConnectionString("DefaultConnection"),
        sqlOptions =>
        {
            sqlOptions.MigrationsAssembly("AutoKosova.DataAccess");
        }));

// Services
builder.Services.AddSingleton<RedisConnectionProvider>();
builder.Services.AddHttpClient("Carapis", client =>
{
    var baseUrl = builder.Configuration["Carapis:BaseUrl"] ?? "https://api.carapis.com";
    var apiKey = builder.Configuration["Carapis:ApiKey"];

    client.BaseAddress = new Uri(baseUrl);
    client.Timeout = TimeSpan.FromSeconds(30);

    if (!string.IsNullOrWhiteSpace(apiKey))
    {
        client.DefaultRequestHeaders.Add("Authorization", $"Bearer {apiKey}");
    }
});

builder.Services.AddScoped<AuthService>();
builder.Services.AddScoped<CarService>();
builder.Services.AddScoped<CarImageService>();
builder.Services.AddScoped<LocalImageStorageService>();
builder.Services.AddScoped<RentalBookingService>();
builder.Services.AddScoped<PasswordService>();
builder.Services.AddScoped<JwtService>();
builder.Services.AddScoped<PermissionService>();
builder.Services.AddScoped<AccountRoleService>();
builder.Services.AddScoped<AccountService>();
builder.Services.AddScoped<AccountRolePermissionService>();
builder.Services.AddScoped<TenantRequestService>();
builder.Services.AddScoped<TenantService>();
builder.Services.AddScoped<EmailQueueService>();
builder.Services.AddScoped<ExternalCarService>();
builder.Services.AddScoped<ExternalCarRequestService>();
builder.Services.AddScoped<IEmailService, EmailService>();
builder.Services.AddHttpClient<PaymentService>();
builder.Services.AddHttpClient<IChatAgentService, ChatAgentService>(client =>
{
    client.Timeout = TimeSpan.FromSeconds(60);
});
builder.Services.AddHostedService<EmailQueueWorker>();
// JWT settings
var jwtKey = builder.Configuration["Jwt:Key"];
var jwtIssuer = builder.Configuration["Jwt:Issuer"];
var jwtAudience = builder.Configuration["Jwt:Audience"];

if (string.IsNullOrWhiteSpace(jwtKey))
{
    throw new Exception("Jwt:Key is missing in appsettings.json.");
}

// Authentication
if (builder.Environment.IsEnvironment("Testing"))
{
    builder.Services
        .AddAuthentication(TestHeaderAuthenticationHandler.SchemeName)
        .AddScheme<AuthenticationSchemeOptions, TestHeaderAuthenticationHandler>(
            TestHeaderAuthenticationHandler.SchemeName,
            _ => { });
}
else
{
    builder.Services
        .AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
        .AddJwtBearer(options =>
        {
            options.RequireHttpsMetadata = false;
            options.SaveToken = true;

            options.TokenValidationParameters = new TokenValidationParameters
            {
                ValidateIssuer = true,
                ValidIssuer = jwtIssuer,

                ValidateAudience = true,
                ValidAudience = jwtAudience,

                ValidateIssuerSigningKey = true,
                IssuerSigningKey = new SymmetricSecurityKey(
                    Encoding.UTF8.GetBytes(jwtKey)
                ),

                ValidateLifetime = true,
                ClockSkew = TimeSpan.Zero
            };
        });
}

// Authorization
builder.Services.AddAuthorization();
builder.Services.AddSingleton<IAuthorizationPolicyProvider, PermissionPolicyProvider>();
builder.Services.AddScoped<IAuthorizationHandler, PermissionAuthorizationHandler>();

// CORS
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowReactApps", policy =>
    {
        policy
            .WithOrigins(
                "http://localhost:3000",
                "https://localhost:3000",
                "http://localhost:3001",
                "https://localhost:3001",
                "http://localhost:5173",
                "https://localhost:5173",
                "http://localhost:5174",
                "https://localhost:5174"
            )
            .AllowAnyHeader()
            .AllowAnyMethod();
    });
});

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    using (var scope = app.Services.CreateScope())
    {
        var logger = scope.ServiceProvider.GetRequiredService<ILoggerFactory>().CreateLogger("Startup");

        try
        {
            var dbContext = scope.ServiceProvider.GetRequiredService<AppDbContext>();
            dbContext.Database.Migrate();
        }
        catch (Exception ex)
        {
            logger.LogWarning(
                ex,
                "Database migration skipped. Start SQL Server or update ConnectionStrings:DefaultConnection. " +
                "Chat and other endpoints that need the database may fail until SQL is available.");
        }
    }

    app.UseSwagger();

    app.UseSwaggerUI(options =>
    {
        options.SwaggerEndpoint("/swagger/v1/swagger.json", "AutoKosova API v1");
    });
}

app.UseHttpsRedirection();

app.UseStaticFiles();

app.UseCors("AllowReactApps");

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

app.Run();

public partial class Program
{
}
