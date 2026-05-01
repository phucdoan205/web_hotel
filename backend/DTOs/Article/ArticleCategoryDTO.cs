namespace backend.DTOs.Article
{
    public class ArticleCategoryDTO
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public bool Status { get; set; }
        public int ArticleCount { get; set; }
    }
}
