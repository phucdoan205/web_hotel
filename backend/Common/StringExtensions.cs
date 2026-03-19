namespace backend.Common
{
    public static class StringExtensions
    {
        public static bool EqualsAnyIgnoreCase(this string? value, params string[] values)
        {
            if (value == null) return false;
            return values.Any(v => string.Equals(value, v, StringComparison.OrdinalIgnoreCase));
        }
    }
}
