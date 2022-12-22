using Microsoft.Extensions.Hosting;
using System.Reflection;

var host = new HostBuilder().ConfigureFunctionsWorkerDefaults(b =>
                             {
                                 b.UseMiddleware<GlobalException>();
                             })
                            .ConfigureServices(s =>
                             {
                                 s.AddMediatR(typeof(LogErrorHandler).GetTypeInfo().Assembly);
                                 s.ConfigureInfrastructure();
                                 s.ConfigurePersistance();
                             })
                            .Build();

host.Run();