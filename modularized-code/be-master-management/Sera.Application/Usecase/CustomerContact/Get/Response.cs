namespace Sera.Application.Usecase
{
    [ExcludeFromCodeCoverage]
    public class GetCustomerContactDetailsResponse
    {
        public int customerContactId { get; set; }
        public string contactName { get; set; }
        public string? functionName { get; set; }       
        public string phoneNumber { get; set; }       
        public string email { get; set; }
        public string position { get; set; }
        public string department { get; set; }
        public string? remarks { get; set; }
        public Boolean isPIC { get; set; }
    }
}