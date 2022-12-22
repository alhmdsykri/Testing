namespace Sera.Application.Usecase
{
    [ExcludeFromCodeCoverage]
    public class GetCustomerContactListResponse
    {
        public int customerContactId { get; set; }
        public string contactName { get; set; }
        public string functionName { get; set; }
        public string email { get; set; }
        public string phoneNumber { get; set; }
        public bool isPIC { get; set; }      
    }   
}