namespace Sera.Application.Usecase
{
    [ExcludeFromCodeCoverage]
    public class GetTripExpenseCategoryResponse
    {
        public int expenseId { get; set; }
        public string expenseName { get; set; }
        public string expenseUnit { get; set; }
    }
}