namespace Sera.Application.Persistor
{
    public class CreateLocationHandler : BaseHandler,
                                         IRequestHandler<CreateLocationRequest, IResultStatus>
    {
        public CreateLocationHandler(IDbContext dbContext, IMessage message, IRESTOrganizationClient orgClient)
               : base(dbContext, message, orgClient)
        { }

        public async Task<IResultStatus> Handle(CreateLocationRequest request,
                                                CancellationToken cancellationToken)
        {
            ResultStatus result = new();

            // Split String Name n Code

            char[] delimiterChars = { '-', '\t' };
            string? branchCode = null;
            string? branchName = null;
            string? buCode = null;
            string? buName = null;
            string locationCodeSeq;

            if (!string.IsNullOrWhiteSpace(request.data.businessUnitName))
            {
                string[] buCodeName = request.data.businessUnitName.Split(delimiterChars);
                buName = buCodeName[0]; //DEFAULT, THERE IS NO BU CODE, ONLY BU NAME

                if (buCodeName.Length > 1 && buCodeName.Length <= 2)
                {
                    buCode = buCodeName[0];
                    buName = buCodeName[1]; //DEFAULT

                    if (buCodeName.Length >= 3) //NOT FEASIBLE, THERE IS A POSSIBILITY THE CODE CONSIST OF 4 CHARS
                    {
                        buCode = null;
                        buName = $"{buCodeName[1]} - {buCodeName[2]}";
                    }
                }

                if (buCodeName.Length >= 3)
                {
                    buCode = buCodeName[0];
                    buName = $"{buCodeName[1]} - {buCodeName[2]}"; //NOT FEASIBLE, THERE IS A POSSIBILITY BU NAME CONSIST OF MORE THAN 1 DASH (-) CHARS
                }
            }

            if (!string.IsNullOrWhiteSpace(request.data.branchName))
            {
                string[] branchCodeName = request.data.branchName.Split(delimiterChars);
                branchName = branchCodeName[0]; //DEFAULT, THERE IS NO BRANCH CODE, ONLY BRANCH NAME

                if (branchCodeName.Length > 1 && branchCodeName.Length <= 2)
                {
                    branchCode = branchCodeName[0];
                    branchName = branchCodeName[1];

                    if (branchCode.Trim().Length > 4)
                    {
                        branchCode = null;
                        branchName = $"{branchCodeName[0]} - {branchCodeName[1]}"; //DEFAULT
                    }
                }

                if (branchCodeName.Length >= 3)
                {
                    branchCode = branchCodeName[0];
                    branchName = $"{branchCodeName[1]} - {branchCodeName[2]}";
                }
            }

            //GENERATE LOCATION CODE FOR FMS
            int seqLocationCode = await dbContext.GenerateCode(AppConst.SEQUENCE_LOCATION);

            if (seqLocationCode == -1)
            {
                return result.ReturnErrorStatus($"Error for transaction Id: {request.transactionId}");
            }
            locationCodeSeq = "F" + string.Format("{0:00000}", seqLocationCode);

            #region Get Business Unit Data

            Response<GetBusinessUnit> apiBusinessUnitResponse = new();

            if (request.data.locationTypeId == (int)LocationType.SUBPOOL || request.data.locationTypeId == (int)LocationType.POOL ||
                request.data.locationTypeId == (int)LocationType.CUSTOMERPOOL)
            {
                apiBusinessUnitResponse = await orgClient.GetBusinessUnitAsync(request.transactionId, request.username, request.data.businessUnitId);

                if (apiBusinessUnitResponse.Message != AppConst.BUSINESS_UNIT_DATA_FOUND)
                {
                    return result.ReturnErrorStatus($"Transaction Id :{request.transactionId}, Message : {apiBusinessUnitResponse.Message}");
                }
            }

            #endregion

            //INSERT INTO SQL SERVER
            string uniqueKey = $"{request.data.longitude}{request.data.latitude}{request.data.locationName.ToLower()}";

            SQL.Location entity = new();
            entity.branchCode = branchCode.Trim();
            entity.branchId = request.data.branchId;
            entity.branchName = branchName.Trim();
            entity.businessUnitCode = buCode.Trim();
            entity.businessUnitId = request.data.businessUnitId;
            entity.businessUnitName = buName.Trim();
            entity.cicoPoolType = request.data.cicoPoolType;
            entity.customerContractId = request.data.customerContractId;
            entity.customerId = request.data.customerId;
            entity.latitude = Math.Round(request.data.latitude, 8);
            entity.locationAddress = request.data.locationAddress;
            entity.locationId = request.data.locationId;
            entity.locationCode = locationCodeSeq;
            entity.locationName = request.data.locationName;
            entity.locationTypeId = request.data.locationTypeId;
            entity.longitude = Math.Round(request.data.longitude, 8);
            entity.parentLocationId = request.data.parentLocationId;
            entity.radius = request.data.radius;
            entity.source = LocationSource.FMS.ToString(); //[REVISIT]
            entity.status = (int)EventStatus.COMPLETED;
            entity.timeOffset = request.data.timeOffset;
            entity.uniqueKey = uniqueKey;
            entity.vendorId = request.data.vendorId;
            entity.version = AppConst.DATA_VERSION;
            entity.workingHour = request.data.workingHour;
            entity.createdBy = request.username;
            entity.createdAt = DateTime.UtcNow;
            entity.modifiedBy = request.username;
            entity.modifiedAt = DateTime.UtcNow;
            entity.transactionId = request.transactionId;

            await dbContext.Location.AddAsync(entity, cancellationToken);

            if (await dbContext.SaveChangesAsync(cancellationToken) <= 0)
            {
                return result.ReturnErrorStatus($"Error for transaction Id: {request.transactionId}");
            }

            request.data.locationId = entity.locationId;

            if (request.data.isNameUpdated && (request.data.locationTypeId == (int)LocationType.SUBPOOL ||
                request.data.locationTypeId == (int)LocationType.POOL || request.data.locationTypeId == (int)LocationType.CUSTOMERPOOL))
            {
                #region CQRS USER

                CreateLocationCQRSRequest cqrsRequest = new();
                cqrsRequest.companyId = apiBusinessUnitResponse.Data.companyId;
                cqrsRequest.companyCode = apiBusinessUnitResponse.Data.companyCode;
                cqrsRequest.companyName = apiBusinessUnitResponse.Data.companyName;
                cqrsRequest.businessUnitId = request.data.businessUnitId;
                cqrsRequest.businessUnitCode = buCode.Trim();
                cqrsRequest.businessUnitName = buName.Trim();
                cqrsRequest.branchId = request.data.branchId;
                cqrsRequest.branchCode = branchCode.Trim();
                cqrsRequest.branchName = branchName.Trim();
                cqrsRequest.locationId = request.data.locationId;
                cqrsRequest.locationCode = locationCodeSeq;
                cqrsRequest.locationName = request.data.locationName;

                ServiceBusRequest<CreateLocationCQRSRequest> sbusUserRequest = new()
                {
                    data = cqrsRequest,
                    entity = request.entity,
                    feURL = request.feURL,
                    method = request.method,
                    source = request.source,
                    status = (int)EventStatus.INPROGRESS,
                    username = request.username,
                    transactionId = request.transactionId,
                    filter = AppConst.SERVICE_BUS_CQRS_LOCATION_USER_SUBS_DLQ_FILTER_NAME,
                    action = AppConst.FA_ACTION_CQRS_CREATE_LOCATION,
                    startDate = DateTime.UtcNow, //[REVISIT]
                    endDate = DateTime.UtcNow.AddHours(AppConst.MAX_DAY_END_DATE) //[REVISIT]
                };

                List<string> jsonUserRequest = new() { sbusUserRequest.Serialize() };

                jsonUserRequest = new() { sbusUserRequest.Serialize() };
                await message.SendMessageAsync(CommonConst.CQRS_SERVICE_BUS_TOPIC_NAME,
                                               AppConst.SERVICE_BUS_CQRS_LOCATION_USER_SUBS_FILTER_NAME,
                                               jsonUserRequest);
                #endregion
            }

            #region SEND MESSAGE TO SERVICE BUS TO CREATE EVENT SOURCE STATUS
            ServiceBusRequest<string> sbusRequest = new()
            {
                data = request.data.Serialize(),
                entity = request.entity,
                feURL = request.feURL,
                method = request.method,
                source = request.source,
                status = (int)EventStatus.COMPLETED,
                username = request.username,
                transactionId = request.transactionId,
            };

            List<string> jsonRequest = new() { sbusRequest.Serialize() };
            await message.SendMessageAsync(AppConst.MASTER_SERVICE_BUS_TOPIC_NAME,
                                           CommonConst.SERVICE_BUS_EVENT_SUBS_FILTER_NAME,
                                           jsonRequest);
            #endregion

            #region SEND MESSAGE TO SERVICE BUS FIREBASE
            await message.SendMessageAsync(AppConst.MASTER_SERVICE_BUS_TOPIC_NAME,
                                           CommonConst.SERVICE_BUS_FIREBASE_SUBS_FILTER_NAME,
                                           jsonRequest);
            #endregion

            return result.ReturnSuccessStatus($"Transaction Id {request.transactionId} success.");
        }
    }
}
