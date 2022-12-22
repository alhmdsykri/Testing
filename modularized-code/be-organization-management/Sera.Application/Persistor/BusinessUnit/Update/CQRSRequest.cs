namespace Sera.Application.Persistor
{
    [ExcludeFromCodeCoverage]
    public class UpdateBusinessUnitCQRSRequest
    {
        public int businessUnitId { get; set; }
        public string businessUnitCode { get; set; }
        public string businessUnitName { get; set; }
    }
}
