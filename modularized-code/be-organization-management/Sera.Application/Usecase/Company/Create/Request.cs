namespace Sera.Application.Usecase
{
    [ExcludeFromCodeCoverage]
    public class CreateCompanyRequest : IRequest<Response>
    {
        public string? companyCode { get; set; }
        public string companyName { get; set; }
        public short? parentCompanyId { get; set; }
        public byte structureLevel { get; set; }
        public bool suspendFlag { get; set; }
        public bool sapIntegrated { get; set; }
    }
}
