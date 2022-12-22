namespace Sera.Application.Usecase
{
    [ExcludeFromCodeCoverage]
    public class UpdateContractRequest : IRequest<Response>
    {
        public int contractId { get; set; }
        public DateTime startDate { get; set; }
        public DateTime endDate { get; set; }
    }
}
