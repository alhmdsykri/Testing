var host = new HostBuilder().ConfigureFunctionsWorkerDefaults()
                            .ConfigureServices(s =>
                             {
                                 s.AddMediatR(typeof(LogErrorHandler).GetTypeInfo().Assembly);
                                 s.ConfigureInfrastructure();
                             }).Build();

host.Run();