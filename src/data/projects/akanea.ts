import { placeholderImage } from "../../utils/helpers";

export const akanea = {
    id: "akanea",
    category: "companies",
    title: "Akanea — Transport Management Platform",
    subtitle: "C# feature development on an enterprise transport management application",
    description:
        "Developed new features and fixed bugs on a transport management application, using C# and Oracle Database, while contributing to architecture improvements and Azure DevOps pipelines.",
    longDescription: `
Full-time C# developer role at Akanea, working on a transport management application used by enterprise clients.

Day to day work covered new feature development and bug fixes against a C# / Oracle Database stack, alongside contributions to an internal framework shared across the product and to a hybrid client/web application built on a 3-tier architecture.

Beyond feature work, I contributed to broader architecture improvements and to the team's Gitflow process, backed by Azure DevOps pipelines for build and release.
`,
    type: "Enterprise Software",
    tech: ["C#", "Oracle Database", "Azure DevOps", "GitFlow"],
    links: {},
    image: placeholderImage("Akanea", "#a78bfa"),
    imageStyle: {
        maxWidth: "1000px",
        maxHeight: "800px",
        objectFit: "contain"
    },

    date: "2025",
    role: "C# Developer",
    highlights: [
        "New features and bug fixes on a transport management application (C#, Oracle Database)",
        "Contributed to architecture improvements and Gitflow processes with Azure DevOps pipelines",
        "Contributed to an internal framework and a hybrid client/web application (3-tier architecture)"
    ],
    featured: false,
    languages: [
        { name: "C#", percent: 90, color: "#68217A" },
        { name: "SQL", percent: 10, color: "#e38c00" }
    ],
    deployHistory: [
        {
            version: "CDI",
            msg: "Transport management platform — feature development & architecture contributions",
            time: "2025",
            status: "success"
        }
    ],
    snippet: `// Internal framework — 3-tier hybrid client/web layer
public class TransportOrderService : ITransportOrderService
{
    private readonly IOracleRepository<TransportOrder> _repository;

    public async Task<TransportOrder> DispatchAsync(TransportOrderRequest request)
    {
        var order = TransportOrder.From(request);
        await _repository.SaveAsync(order);
        return order;
    }
}
`,
    architecture: `
[ Web / Client Hybrid App ]
          |
          v
[ Internal C# Framework ] -- 3-tier architecture
          |
          v
[ Business Logic Layer ]
          |
          v
[ Oracle Database ]

CI/CD: Azure DevOps pipelines + Gitflow
`
};
