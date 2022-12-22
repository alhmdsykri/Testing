namespace Sera.Application.Usecase
{
    [ExcludeFromCodeCoverage]
    public class GetCustomerContactListValidation : AbstractValidator<GetCustomerContactListRequest>
    {
        public GetCustomerContactListValidation()
        {
            RuleFor(x => x.customerId).NotEmpty();
        }
    }
}