using backend.Models;

public interface IJwtService
{
    string CreateToken(User user, IEnumerable<string> permissions);
}
