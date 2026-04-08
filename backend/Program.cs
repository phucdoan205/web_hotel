using Microsoft.EntityFrameworkCore;
using backend.Data;
using backend.Mappers;
using System.Text.Json.Serialization;
using FluentValidation;
using FluentValidation.AspNetCore;
using Microsoft.AspNetCore.Authentication.JwtBearer; 
using Microsoft.IdentityModel.Tokens; 
using System.Text;
using backend.Data.Interceptors;
using backend.Services;
using backend.DTOs.Room;
using backend.DTOs.RoomInventory;
//using backend.Validators;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.ReferenceHandler = ReferenceHandler.IgnoreCycles;
    });

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();
builder.Services.AddCors(options =>
{
    options.AddPolicy("FrontendDev", policy =>
    {
        policy.WithOrigins("http://localhost:5173", "http://127.0.0.1:5173")
            .AllowAnyHeader()
            .AllowAnyMethod();
    });
});

builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer = builder.Configuration["Jwt:Issuer"],
            ValidAudience = builder.Configuration["Jwt:Audience"],
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(builder.Configuration["Jwt:Key"]!))
        };
    });

builder.Services.AddFluentValidationAutoValidation();
builder.Services.AddFluentValidationClientsideAdapters();
builder.Services.AddValidatorsFromAssemblyContaining<Program>();
builder.Services.AddHttpClient();
builder.Services.AddScoped<CloudinaryService>();
builder.Services.AddSingleton<backend.Services.HousekeepingTaskLockService>();
builder.Services.AddScoped<IJwtService, JwtService>(); 
builder.Services.AddSingleton<NotificationRealtimeService>();
builder.Services.AddScoped<NotificationService>();
builder.Services.AddScoped<IEmailService, SmtpEmailService>();

//builder.Services.AddValidatorsFromAssemblyContaining<CreateRoomDtoValidator>();
//builder.Services.AddScoped<IValidator<BulkCreateRoomDTO>, BulkCreateRoomDtoValidator>();
//builder.Services.AddScoped<IValidator<CloneRoomInventoryDTO>, CloneRoomInventoryDtoValidator>();

builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection"))
    .AddInterceptors(new SoftDeleteInterceptor()));
builder.Services.AddAutoMapper(typeof(AutoMapperProfile));

var app = builder.Build();

using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    await db.Database.ExecuteSqlRawAsync(@"
IF COL_LENGTH('Vouchers', 'IsActive') IS NULL
BEGIN
    ALTER TABLE Vouchers
    ADD IsActive bit NOT NULL CONSTRAINT DF_Vouchers_IsActive DEFAULT(1);
END
");
    await db.Database.ExecuteSqlRawAsync(@"
IF COL_LENGTH('Articles', 'Summary') IS NULL ALTER TABLE Articles ADD Summary nvarchar(max) NULL;
IF COL_LENGTH('Articles', 'Tags') IS NULL ALTER TABLE Articles ADD Tags nvarchar(max) NULL;
IF COL_LENGTH('Articles', 'IsApproved') IS NULL ALTER TABLE Articles ADD IsApproved bit NOT NULL CONSTRAINT DF_Articles_IsApproved DEFAULT(0);
IF COL_LENGTH('Articles', 'CreatedAt') IS NULL ALTER TABLE Articles ADD CreatedAt datetime NOT NULL CONSTRAINT DF_Articles_CreatedAt DEFAULT(GETUTCDATE());
IF COL_LENGTH('Articles', 'UpdatedAt') IS NULL ALTER TABLE Articles ADD UpdatedAt datetime NULL;
IF COL_LENGTH('Articles', 'ApprovedAt') IS NULL ALTER TABLE Articles ADD ApprovedAt datetime NULL;
IF COL_LENGTH('Articles', 'ApprovedById') IS NULL ALTER TABLE Articles ADD ApprovedById int NULL;
IF COL_LENGTH('Articles', 'IsDeleted') IS NULL ALTER TABLE Articles ADD IsDeleted bit NOT NULL CONSTRAINT DF_Articles_IsDeleted DEFAULT(0);
IF COL_LENGTH('Articles', 'DeletedAt') IS NULL ALTER TABLE Articles ADD DeletedAt datetime NULL;
IF OBJECT_ID('FK_Articles_Users_ApprovedById', 'F') IS NULL
BEGIN
    ALTER TABLE Articles WITH NOCHECK
    ADD CONSTRAINT FK_Articles_Users_ApprovedById FOREIGN KEY (ApprovedById) REFERENCES Users(Id);
END
IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'IX_Articles_Slug' AND object_id = OBJECT_ID('Articles'))
BEGIN
    CREATE INDEX IX_Articles_Slug ON Articles(Slug);
END
IF OBJECT_ID('ArticleComments', 'U') IS NULL
BEGIN
    CREATE TABLE ArticleComments (
        Id int IDENTITY(1,1) NOT NULL PRIMARY KEY,
        ArticleId int NOT NULL,
        UserId int NOT NULL,
        ParentCommentId int NULL,
        TaggedUserId int NULL,
        Content nvarchar(max) NOT NULL,
        CreatedAt datetime NOT NULL CONSTRAINT DF_ArticleComments_CreatedAt DEFAULT(GETUTCDATE()),
        UpdatedAt datetime NULL,
        CONSTRAINT FK_ArticleComments_Articles_ArticleId FOREIGN KEY (ArticleId) REFERENCES Articles(Id) ON DELETE CASCADE,
        CONSTRAINT FK_ArticleComments_Users_UserId FOREIGN KEY (UserId) REFERENCES Users(Id),
        CONSTRAINT FK_ArticleComments_Users_TaggedUserId FOREIGN KEY (TaggedUserId) REFERENCES Users(Id),
        CONSTRAINT FK_ArticleComments_ArticleComments_ParentCommentId FOREIGN KEY (ParentCommentId) REFERENCES ArticleComments(Id)
    );
END
");
}

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseCors("FrontendDev");

if (!app.Environment.IsDevelopment())
{
    app.UseHttpsRedirection();
}

app.UseAuthentication(); 
app.UseAuthorization();

app.MapControllers();

app.Run();
