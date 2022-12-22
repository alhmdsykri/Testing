namespace Sera.Application.Usecase
{
    [ExcludeFromCodeCoverage]
    public class CreateContractRequest : IRequest<Response>
    {
        public int customerId { get; set; }
        public int businessUnitId { get; set; }
        public string businessUnitCode { get; set; }
        public string businessUnitName { get; set; }
        public DateTime startDate { get; set; }
        public DateTime endDate { get; set; }
    }
}
