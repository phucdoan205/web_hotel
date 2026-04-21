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

//Dùng cho AuditLog, không được xoá
builder.Services.AddHttpContextAccessor();
builder.Services.AddScoped<AuditSaveChangesInterceptor>();
builder.Services.AddSingleton<AuditLogCleanupService>();
builder.Services.AddHostedService(sp => sp.GetRequiredService<AuditLogCleanupService>());

builder.Services.AddDbContext<AppDbContext>((sp, options) =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection"))
    .AddInterceptors(new SoftDeleteInterceptor())
    .AddInterceptors(sp.GetRequiredService<AuditSaveChangesInterceptor>())); //Dùng cho AuditLog, không được xoá
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
    await db.Database.ExecuteSqlRawAsync(@"
IF COL_LENGTH('Invoices', 'BookingDetailId') IS NULL ALTER TABLE Invoices ADD BookingDetailId int NULL;
IF COL_LENGTH('Invoices', 'VoucherId') IS NULL ALTER TABLE Invoices ADD VoucherId int NULL;
IF COL_LENGTH('Invoices', 'Code') IS NULL ALTER TABLE Invoices ADD Code nvarchar(50) NULL;
IF COL_LENGTH('Invoices', 'BookingCode') IS NULL ALTER TABLE Invoices ADD BookingCode nvarchar(50) NULL;
IF COL_LENGTH('Invoices', 'GuestName') IS NULL ALTER TABLE Invoices ADD GuestName nvarchar(255) NULL;
IF COL_LENGTH('Invoices', 'RoomNumber') IS NULL ALTER TABLE Invoices ADD RoomNumber nvarchar(50) NULL;
IF COL_LENGTH('Invoices', 'RoomName') IS NULL ALTER TABLE Invoices ADD RoomName nvarchar(255) NULL;
IF COL_LENGTH('Invoices', 'RoomRate') IS NULL ALTER TABLE Invoices ADD RoomRate decimal(18,2) NULL;
IF COL_LENGTH('Invoices', 'CheckInDate') IS NULL ALTER TABLE Invoices ADD CheckInDate datetime NULL;
IF COL_LENGTH('Invoices', 'CheckOutDate') IS NULL ALTER TABLE Invoices ADD CheckOutDate datetime NULL;
IF COL_LENGTH('Invoices', 'StayedDays') IS NULL ALTER TABLE Invoices ADD StayedDays int NULL;
IF COL_LENGTH('Invoices', 'Notes') IS NULL ALTER TABLE Invoices ADD Notes nvarchar(max) NULL;
IF COL_LENGTH('Invoices', 'VoucherCode') IS NULL ALTER TABLE Invoices ADD VoucherCode nvarchar(50) NULL;
IF COL_LENGTH('Invoices', 'VoucherDiscountType') IS NULL ALTER TABLE Invoices ADD VoucherDiscountType nvarchar(50) NULL;
IF COL_LENGTH('Invoices', 'VoucherDiscountValue') IS NULL ALTER TABLE Invoices ADD VoucherDiscountValue decimal(18,2) NULL;
IF COL_LENGTH('Invoices', 'CreatedAt') IS NULL ALTER TABLE Invoices ADD CreatedAt datetime NULL;
IF COL_LENGTH('Invoices', 'UpdatedAt') IS NULL ALTER TABLE Invoices ADD UpdatedAt datetime NULL;
IF COL_LENGTH('Invoices', 'PaidAt') IS NULL ALTER TABLE Invoices ADD PaidAt datetime NULL;
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
