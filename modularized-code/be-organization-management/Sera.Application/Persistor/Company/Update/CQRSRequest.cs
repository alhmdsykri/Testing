namespace Sera.Application.Persistor
{
    [ExcludeFromCodeCoverage]
    public class UpdateCompanyCQRSRequest
    {
        public int companyId { get; set; }
        public string companyCode { get; set; }
        public string companyName { get; set; }
    }
}
