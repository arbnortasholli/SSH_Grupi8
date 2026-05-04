using AutoKosova.DataAccess;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddControllers(); // Adds controller services to the DI container

// Register OpenAPI (Swagger) for API documentation
builder.Services.AddOpenApi();

// Register DbContext (AppDbContext) for dependency injection
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseSqlServer(
        builder.Configuration.GetConnectionString("DefaultConnection"),
        sqlOptions =>
        {
            sqlOptions.MigrationsAssembly("AutoKosova.DataAccess");
        }));

builder.Services.AddCors();

// Build the app
var app = builder.Build();

// Configure the HTTP request pipeline
if (app.Environment.IsDevelopment())
{
    // Enable OpenAPI (Swagger) in development
    app.MapOpenApi();
}

app.UseHttpsRedirection(); // Redirect HTTP requests to HTTPS
app.UseAuthorization();    // Enable authorization middleware

// Map controllers to the app (i.e., configure routing for controllers)
app.UseCors(x => x.AllowAnyHeader().AllowAnyMethod()
    .WithOrigins("http://localhost:3000", "https://localhost:3000"));

app.MapControllers();

// Apply database migrations at startup to ensure the database is up-to-date
using (var scope = app.Services.CreateScope())
{
    var services = scope.ServiceProvider;

    try
    {
        // Get AppDbContext from DI container
        var context = services.GetRequiredService<AppDbContext>();

        // Apply any pending migrations asynchronously
        await context.Database.MigrateAsync();
    }
    catch (Exception ex)
    {
        // Handle errors during migration (you can log the exception here)
        Console.WriteLine($"An error occurred during migration: {ex.Message}");
        throw; // Rethrow the exception to stop the application startup
    }
}

// Run the application
app.Run();