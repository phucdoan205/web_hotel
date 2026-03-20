using CloudinaryDotNet;
using CloudinaryDotNet.Actions;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Configuration;

public class CloudinaryService
{
    private readonly Cloudinary _cloudinary;

    public CloudinaryService(IConfiguration config)
    {
        var account = new Account(
            config["Cloudinary:CloudName"],
            config["Cloudinary:ApiKey"],
            config["Cloudinary:ApiSecret"]
        );

        _cloudinary = new Cloudinary(account);
    }

    public async Task<string?> UploadImageAsync(IFormFile file, string? folder = null)
    {
        if (file == null || file.Length <= 0) return null;

        await using var stream = file.OpenReadStream();

        var uploadParams = new ImageUploadParams
        {
            File = new FileDescription(file.FileName, stream),
            Folder = string.IsNullOrWhiteSpace(folder) ? "hotel_assets" : folder.Trim()
        };

        var uploadResult = await _cloudinary.UploadAsync(uploadParams);

        if (uploadResult.Error != null)
        {
            return null;
        }

        return uploadResult.SecureUrl?.ToString();
    }

    public async Task<bool> DeleteImageByUrlAsync(string? imageUrl)
    {
        if (string.IsNullOrWhiteSpace(imageUrl))
        {
            return true;
        }

        var publicId = ExtractPublicIdFromUrl(imageUrl);
        if (string.IsNullOrWhiteSpace(publicId))
        {
            return false;
        }

        var deleteResult = await _cloudinary.DestroyAsync(new DeletionParams(publicId));
        return deleteResult.Result == "ok" || deleteResult.Result == "not found";
    }

    private static string? ExtractPublicIdFromUrl(string imageUrl)
    {
        if (!Uri.TryCreate(imageUrl, UriKind.Absolute, out var uri))
        {
            return null;
        }

        var segments = uri.AbsolutePath.Trim('/').Split('/', StringSplitOptions.RemoveEmptyEntries);
        var uploadIndex = Array.IndexOf(segments, "upload");
        if (uploadIndex < 0 || uploadIndex + 1 >= segments.Length)
        {
            return null;
        }

        var startIndex = uploadIndex + 1;
        if (segments[startIndex].StartsWith("v", StringComparison.OrdinalIgnoreCase))
        {
            startIndex++;
        }

        if (startIndex >= segments.Length)
        {
            return null;
        }

        var publicIdWithExtension = string.Join("/", segments[startIndex..]);
        var extension = Path.GetExtension(publicIdWithExtension);

        return string.IsNullOrWhiteSpace(extension)
            ? publicIdWithExtension
            : publicIdWithExtension[..^extension.Length];
    }
}
