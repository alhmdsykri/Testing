namespace Sera.Application.Usecase
{
    [ExcludeFromCodeCoverage]
    public class UpdateBusinessUnitRequest : IRequest<Response>
    {
        public int businessUnitId { get; set; }
        public string businessUnitCode { get; set; }
        public string businessUnitName { get; set; }
        public short companyId { get; set; }
        public bool sapIntegrated { get; set; }
        public bool isNameUpdated { get; set; }
    }
}
