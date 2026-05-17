namespace backend.DTOs
{
    public class SepayWebhookDTO
    {
        public int id { get; set; }
        public string gateway { get; set; } = null!;
        public string transactionDate { get; set; } = null!;
        public string accountNumber { get; set; } = null!;
        public string subAccount { get; set; } = null!;
        public string code { get; set; } = null!;
        public string content { get; set; } = null!;
        public string transferType { get; set; } = null!;
        public decimal transferAmount { get; set; }
        public decimal accumulated { get; set; }
        public string referenceCode { get; set; } = null!;
    }
}
