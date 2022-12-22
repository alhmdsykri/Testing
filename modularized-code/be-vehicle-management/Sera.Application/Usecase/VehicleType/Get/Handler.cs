namespace Sera.Application.Usecase
{
    public class GetVehicleTypeHandler : BaseHandler,
        IRequestHandler<GetVehicleTypeRequest, Response<GetVehicleTypeResponse>>
    {
        public GetVehicleTypeHandler(IHttpContextAccessor httpContext, IDbContext dbContext)
            : base(httpContext, dbContext)
        { }

        public async Task<Response<GetVehicleTypeResponse>> Handle(
            GetVehicleTypeRequest request, CancellationToken cancellationToken)
        {

            Response<GetVehicleTypeResponse> response = new();
            string statusContract = string.Empty;
            var vehicleType = await dbContext.VehicleType
                                             .AsNoTracking()
                                             .Where(x => x.vehicleTypeId == request.vehicleTypeId)
                                             .Select(x => new GetVehicleTypeResponse()
                                             {
                                                 vehicleTypeId = x.vehicleTypeId,
                                                 vehicleTypeCode = x.vehicleTypeCode,
                                                 vehicleTypeName = x.vehicleTypeName,
                                                 driverLicenseTypeId = x.driverLicenseTypeId,
                                                 driverLicenseTypeCode = x.driverLicenseTypeCode,
                                                 driverLicenseTypeName = x.driverLicenseTypeName,
                                                 description = x.description,
                                                 modifiedAt = x.modifiedAt
                                             }).FirstOrDefaultAsync(cancellationToken: cancellationToken);

            if (vehicleType == null)
            {
                return response.Fail(TransactionId, Message.NotFound("Vehicle Type"), null);
            }

            return response.Success(TransactionId, Message.Found("Vehicle Type"), vehicleType);
        }
    }
}