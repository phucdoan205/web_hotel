using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using backend.Models;

public class JwtService : IJwtService
{
    private readonly IConfiguration _config;

    public JwtService(IConfiguration config)
    {
        _config = config;
    }

    public string CreateToken(User user)
    {
        var claims = new List<Claim>
        {
            new Claim(JwtRegisteredClaimNames.NameId, user.Id.ToString()),
            new Claim(JwtRegisteredClaimNames.Email, user.Email),
            new Claim("FullName", user.FullName),
            new Claim(ClaimTypes.Role, user.Role?.Name ?? "Customer")
        };

        if (!string.IsNullOrWhiteSpace(user.GoogleId))
        {
            claims.Add(new Claim("GoogleId", user.GoogleId));
        }

        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_config["Jwt:Key"]!));
        var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

        var tokenDescriptor = new SecurityTokenDescriptor
        {
            Subject = new ClaimsIdentity(claims),
            Expires = DateTime.Now.AddHours(Convert.ToDouble(_config["Jwt:DurationInHours"])),
            SigningCredentials = creds,
            Issuer = _config["Jwt:Issuer"],
            Audience = _config["Jwt:Audience"]
        };

        var tokenHandler = new JwtSecurityTokenHandler();
        var token = tokenHandler.CreateToken(tokenDescriptor);

        return tokenHandler.WriteToken(token);
    }
}
