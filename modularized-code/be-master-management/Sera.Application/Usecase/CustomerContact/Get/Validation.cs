namespace Sera.Application.Usecase
{
    [ExcludeFromCodeCoverage]
    public class GetCustomerContactDetailsValidation : AbstractValidator<GetCustomerContactDetailsRequest>
    {
        public GetCustomerContactDetailsValidation()
        {
            RuleFor(x => x.customerContactId).NotEmpty();
        }
    }
}