namespace Sera.Application.Usecase
{
    [ExcludeFromCodeCoverage]
    public class FindTripExpenseResponse
    {        
        public int tripExpenseId { get; set; }
        public string vehicleTypeCode { get; set; }
        public string vehicleTypeName { get; set; }
        public decimal totalExpense { get; set; }
        public decimal? revenue { get; set; }
        public decimal? COGS { get; set; }
        public string uomCode { get; set; }
    }
}