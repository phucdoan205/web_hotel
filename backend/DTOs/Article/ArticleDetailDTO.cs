namespace backend.DTOs.Article
{
    public class ArticleDetailDTO : ArticleListItemDTO
    {
        public string? Content { get; set; }
        public DateTime? UpdatedAt { get; set; }
        public DateTime? ApprovedAt { get; set; }
        public int? ApprovedById { get; set; }
        public string? ApprovedByName { get; set; }
        public List<ArticleCommentDTO> Comments { get; set; } = new();
    }
}
