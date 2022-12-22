namespace Sera.Application.Usecase
{
    [ExcludeFromCodeCoverage]
    public class CreateCustomerContactRequest : IRequest<Response>
    {
        public int customerId { get; set; }
        public string contactName { get; set; }
        public string functionName { get; set; }
        public string phoneNumber { get; set; }
        public string email { get; set; }
        public string? position { get; set; }
        public string? departement { get; set; }
        public string? remarks { get; set; }
        public bool isPIC { get; set; } = false;    
    }
}
