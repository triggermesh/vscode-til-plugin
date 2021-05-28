export type AttributeSchema = [string, string, string?];

export interface BlockSchema {
    type: string;
    kind?: string;
    kindNeeded: boolean;
    nameNeeded: boolean;
    members?: Array<AttributeSchema | BlockSchema>;
    documentation?: string;
}

/**
 * https://github.com/triggermesh/bridgedl/wiki
 */
export const bridges: readonly BlockSchema[] = [
    {
        type: "bridge",
        kindNeeded: false,
        nameNeeded: true
    }
];

/**
 * https://github.com/triggermesh/bridgedl/wiki/Channels
 */
export const channels: readonly BlockSchema[] = [
    {
        type: "channel",
        kind: "pubsub",
        kindNeeded: true,
        nameNeeded: true,
        members: [["subscribers", "[\n\t$1\n]"]]
    }
];

/**
 * https://github.com/triggermesh/bridgedl/wiki/Routers
 */
export const routers: readonly BlockSchema[] = [
    {
        type: "router",
        kind: "content_based",
        kindNeeded: true,
        nameNeeded: true,
        members: [
            {
                type: "route",
                kindNeeded: false,
                nameNeeded: false,
                members: [
                    ["attributes", "{}"],
                    ["condition ", '"$1"'],
                    ["to", ""]
                ]
            }
        ],
        documentation: "Content-based router"
    },
    {
        type: "router",
        kind: "data_expression_filter",
        kindNeeded: true,
        nameNeeded: true,
        members: [
            ["condition", '"$1"', "Filtering expression"],
            ["to", "", "Routing destination"]
        ],
        documentation: "Router, filtering by certain expression"
    },
    {
        type: "router",
        kind: "splitter",
        kindNeeded: true,
        nameNeeded: true,
        members: [
            ["path", '"$1"'],
            {
                type: "ce_context",
                kindNeeded: false,
                nameNeeded: false,
                members: [
                    ["type", '"$1"'],
                    ["source", '"$1"'],
                    ["extensions", "{}"]
                ],
                documentation: "Context"
            },
            ["to", "", "Routing destination"]
        ],
        documentation: "Splitting router"
    }
];

/**
 * https://github.com/triggermesh/bridgedl/wiki/Sources
 */
export const sources: readonly BlockSchema[] = [
    {
        type: "source",
        kind: "aws_cloudwatch",
        kindNeeded: true,
        nameNeeded: true,
        members: [
            ["region", '"$1"'],
            ["polling_interval", '"$1"'],
            {
                type: "metric_query",
                kindNeeded: false,
                nameNeeded: true,
                members: [
                    ["expression", '"$1"'],
                    {
                        type: "metric",
                        kindNeeded: false,
                        nameNeeded: false,
                        members: [
                            ["period", ""],
                            ["stat", '"$1"'],
                            ["unit", '"$1"'],
                            ["name", '"$1"'],
                            ["namespace", '"$1"'],
                            {
                                type: "dimension",
                                kindNeeded: false,
                                nameNeeded: true,
                                members: [["value", '"$1"']]
                            }
                        ]
                    }
                ]
            },
            ["credentials", 'secret_name("$1")'],
            ["to", ""]
        ]
    },
    {
        type: "source",
        kind: "aws_cloudwatch_logs",
        kindNeeded: true,
        nameNeeded: true,
        members: [
            ["arn", '"$1"'],
            ["polling_interval", '"$1"'],
            ["credentials", 'secret_name("$1")'],
            ["to", ""]
        ]
    },
    {
        type: "source",
        kind: "aws_codecommit",
        kindNeeded: true,
        nameNeeded: true,
        members: [
            ["arn", '"$1"'],
            ["branch", '"$1"'],
            ["event_types", "[\n\t$1\n]"],
            ["credentials", 'secret_name("$1")'],
            ["to", ""]
        ]
    },
    {
        type: "source",
        kind: "aws_cognito_userpool",
        kindNeeded: true,
        nameNeeded: true,
        members: [
            ["arn", '"$1"'],
            ["credentials", 'secret_name("$1")'],
            ["to", ""]
        ]
    },
    {
        type: "source",
        kind: "aws_dynamodb",
        kindNeeded: true,
        nameNeeded: true,
        members: [
            ["arn", '"$1"'],
            ["credentials", 'secret_name("$1")'],
            ["to", ""]
        ]
    },
    {
        type: "source",
        kind: "aws_kinesis",
        kindNeeded: true,
        nameNeeded: true,
        members: [
            ["arn", '"$1"'],
            ["credentials", 'secret_name("$1")'],
            ["to", ""]
        ]
    },
    {
        type: "source",
        kind: "aws_pi",
        kindNeeded: true,
        nameNeeded: true,
        members: [
            ["region", '"$1"'],
            ["polling_interval", '"$1"'],
            ["identifier", '"$1"'],
            ["metric_query", '"$1"'],
            ["credentials", 'secret_name("$1")'],
            ["to", ""]
        ]
    },
    {
        type: "source",
        kind: "aws_pi",
        kindNeeded: true,
        nameNeeded: true,
        members: [
            ["region", '"$1"'],
            ["polling_interval", '"$1"'],
            ["identifier", '"$1"'],
            ["metric_query", '"$1"'],
            ["credentials", 'secret_name("$1")'],
            ["to", ""]
        ]
    },
    {
        type: "source",
        kind: "aws_s3",
        kindNeeded: true,
        nameNeeded: true,
        members: [
            ["arn", '"$1"'],
            ["event_types", "[\n\t$1\n]"],
            ["credentials", 'secret_name("$1")'],
            ["to", ""]
        ]
    },
    {
        type: "source",
        kind: "aws_sns",
        kindNeeded: true,
        nameNeeded: true,
        members: [
            ["arn", '"$1"'],
            ["credentials", 'secret_name("$1")'],
            ["to", ""]
        ]
    },
    {
        type: "source",
        kind: "aws_sqs",
        kindNeeded: true,
        nameNeeded: true,
        members: [
            ["arn", '"$1"'],
            ["credentials", 'secret_name("$1")'],
            ["to", ""]
        ]
    },
    {
        type: "source",
        kind: "azure_activity_logs",
        kindNeeded: true,
        nameNeeded: true,
        members: [
            ["event_hub_id", '"$1"'],
            ["event_hubs_sas_policy", '"$1"'],
            ["categories", "[\n\t$1\n]"],
            ["auth", 'secret_name("$1")'],
            ["to", ""]
        ]
    },
    {
        type: "source",
        kind: "azure_blob_storage",
        kindNeeded: true,
        nameNeeded: true,
        members: [
            ["storage_account_id", '"$1"'],
            ["event_hub_id", '"$1"'],
            ["event_types", "[\n\t$1\n]"],
            ["auth", 'secret_name("$1")'],
            ["to", ""]
        ]
    },
    {
        type: "source",
        kind: "azure_event_hubs",
        kindNeeded: true,
        nameNeeded: true,
        members: [
            ["hub_namespace", '"$1"'],
            ["hub_name", '"$1"'],
            ["auth", 'secret_name("$1")'],
            ["to", ""]
        ]
    },
    {
        type: "source",
        kind: "github",
        kindNeeded: true,
        nameNeeded: true,
        members: [
            ["owner_and_repository", '"$1"'],
            ["event_types", "[\n\t$1\n]"],
            ["tokens", 'secret_name("$1")'],
            ["to", ""]
        ]
    },
    {
        type: "source",
        kind: "httppoller",
        kindNeeded: true,
        nameNeeded: true,
        members: [
            ["endpoint", '"$1"'],
            ["method", '"$1"'],
            ["interval", '"$1"'],
            ["event_type", '"$1"'],
            ["event_source", '"$1"'],
            ["to", ""]
        ]
    },
    {
        type: "source",
        kind: "kafka",
        kindNeeded: true,
        nameNeeded: true,
        members: [
            ["topics", "[\n\t$1\n]"],
            ["bootstrap_servers", "[\n\t$1\n]"],
            ["consumer_group", '"$1"'],
            ["sasl_auth", 'secret_name("$1")'],
            ["tls", '${1|secret_name(""),true|}'],
            ["to", ""]
        ]
    },
    {
        type: "source",
        kind: "ping",
        kindNeeded: true,
        nameNeeded: true,
        members: [
            ["data", '"$1"'],
            ["content_type", '"$1"'],
            ["schedule", '"$1"'],
            ["to", ""]
        ]
    },
    {
        type: "source",
        kind: "salesforce",
        kindNeeded: true,
        nameNeeded: true,
        members: [
            ["channel", '"$1"'],
            ["replay_id", ""],
            ["client_id", '"$1"'],
            ["server", '"$1"'],
            ["user", '"$1"'],
            ["secret_key", 'secret_name("$1")'],
            ["to", ""]
        ]
    },
    {
        type: "source",
        kind: "slack",
        kindNeeded: true,
        nameNeeded: true,
        members: [
            ["signing_secret", 'secret_name("$1")'],
            ["app_id", '"$1"'],
            ["to", ""]
        ]
    },
    {
        type: "source",
        kind: "webhook",
        kindNeeded: true,
        nameNeeded: true,
        members: [
            ["event_type", '"$1"'],
            ["event_source", '"$1"'],
            ["basic_auth_username", '"$1"'],
            ["basic_auth_password", '"$1"'],
            ["to", ""]
        ]
    },
    {
        type: "source",
        kind: "zendesk",
        kindNeeded: true,
        nameNeeded: true,
        members: [
            ["subdomain", '"$1"'],
            ["email", '"$1"'],
            ["api_auth", 'secret_name("$1")'],
            ["webhook_username", '"$1"'],
            ["webhook_password", '"$1"'],
            ["to", ""]
        ]
    }
];

/**
 * https://github.com/triggermesh/bridgedl/wiki/Transformers
 */
export const transformers: readonly BlockSchema[] = [
    {
        type: "transformer",
        kind: "bumblebee",
        kindNeeded: true,
        nameNeeded: true,
        members: [
            {
                type: "context",
                kindNeeded: false,
                nameNeeded: false,
                members: [
                    {
                        type: "operation",
                        kindNeeded: false,
                        nameNeeded: true,
                        members: [
                            {
                                type: "path",
                                kindNeeded: false,
                                nameNeeded: false,
                                members: [
                                    ["key", '"$1"'],
                                    ["value", '"$1"']
                                ]
                            }
                        ]
                    }
                ]
            },
            {
                type: "data",
                kindNeeded: false,
                nameNeeded: false,
                members: [
                    {
                        type: "operation",
                        kindNeeded: false,
                        nameNeeded: true,
                        members: [
                            {
                                type: "path",
                                kindNeeded: false,
                                nameNeeded: false,
                                members: [
                                    ["key", '"$1"'],
                                    ["value", '"$1"']
                                ]
                            }
                        ]
                    }
                ]
            },
            ["to", ""]
        ]
    },
    {
        type: "transformer",
        kind: "function",
        kindNeeded: true,
        nameNeeded: true,
        members: [
            ["runtime", '"$1"'],
            ["entrypoint", '"$1"'],
            ["public", "${1|true,false|}"],
            ["code", 'file("$1")'],
            {
                type: "ce_context",
                kindNeeded: false,
                nameNeeded: false,
                members: [
                    ["type", '"$1"'],
                    ["source", '"$1"'],
                    ["subject", '"$1"']
                ]
            },
            ["to", ""]
        ]
    }
];

/**
 * https://github.com/triggermesh/bridgedl/wiki/Targets
 */
export const targets: readonly BlockSchema[] = [
    {
        type: "target",
        kind: "aws_dynamodb",
        kindNeeded: true,
        nameNeeded: true,
        members: [
            ["arn", '"$1"'],
            ["credentials", 'secret_name("$1")'],
            ["to", ""]
        ]
    },
    {
        type: "target",
        kind: "aws_kinesis",
        kindNeeded: true,
        nameNeeded: true,
        members: [
            ["arn", '"$1"'],
            ["partition", '"$1"'],
            ["credentials", 'secret_name("$1")'],
            ["reply_to", ""]
        ]
    },
    {
        type: "target",
        kind: "aws_lambda",
        kindNeeded: true,
        nameNeeded: true,
        members: [
            ["arn", '"$1"'],
            ["credentials", 'secret_name("$1")'],
            ["reply_to", ""]
        ]
    },
    {
        type: "target",
        kind: "aws_s3",
        kindNeeded: true,
        nameNeeded: true,
        members: [
            ["arn", '"$1"'],
            ["credentials", 'secret_name("$1")'],
            ["reply_to", ""]
        ]
    },
    {
        type: "target",
        kind: "aws_sns",
        kindNeeded: true,
        nameNeeded: true,
        members: [
            ["arn", '"$1"'],
            ["credentials", 'secret_name("$1")'],
            ["reply_to", ""]
        ]
    },
    {
        type: "target",
        kind: "aws_sqs",
        kindNeeded: true,
        nameNeeded: true,
        members: [
            ["arn", '"$1"'],
            ["credentials", 'secret_name("$1")'],
            ["reply_to", ""]
        ]
    },
    {
        type: "target",
        kind: "container",
        kindNeeded: true,
        nameNeeded: true,
        members: [
            ["image", '"$1"'],
            ["public", "${1|true,false|}"],
            {
                type: "env_var",
                kindNeeded: false,
                nameNeeded: true,
                members: [["value", '"$1"']]
            },
            ["env_vars", "{ NAME: VALUE }"]
        ]
    },
    {
        type: "target",
        kind: "datadog",
        kindNeeded: true,
        nameNeeded: true,
        members: [
            ["metric_prefix", '"$1"'],
            ["auth", 'secret_name("$1")'],
            ["reply_to", ""]
        ]
    },
    {
        type: "target",
        kind: "event_display",
        kindNeeded: true,
        nameNeeded: true,
        members: []
    },
    {
        type: "target",
        kind: "function",
        kindNeeded: true,
        nameNeeded: true,
        members: [
            ["runtime", '"$1"'],
            ["entrypoint", '"$1"'],
            ["public", "${1|true,false|}"],
            ["code", 'file("$1")'],
            {
                type: "ce_context",
                kindNeeded: false,
                nameNeeded: false,
                members: [
                    ["type", '"$1"'],
                    ["source", '"$1"'],
                    ["subject", '"$1"']
                ]
            },
            ["reply_to", ""]
        ]
    },
    {
        type: "target",
        kind: "gcloud_storage",
        kindNeeded: true,
        nameNeeded: true,
        members: [
            ["bucket_name", '"$1"'],
            ["service_account", 'secret_name("$1")'],
            ["reply_to", ""]
        ]
    },
    {
        type: "target",
        kind: "kafka",
        kindNeeded: true,
        nameNeeded: true,
        members: [
            ["topic", '"$1"'],
            ["bootstrap_servers", "[\n\t$1\n]"],
            ["auth", 'secret_name("$1")'],
            ["reply_to", ""]
        ]
    },
    {
        type: "target",
        kind: "logz",
        kindNeeded: true,
        nameNeeded: true,
        members: [
            ["logs_listener_url", '"$1"'],
            ["auth", 'secret_name("$1")'],
            ["reply_to", ""]
        ]
    },
    {
        type: "target",
        kind: "sendgrid",
        kindNeeded: true,
        nameNeeded: true,
        members: [
            ["default_from_email", '"$1"'],
            ["default_from_name", '"$1"'],
            ["default_to_email", '"$1"'],
            ["default_to_name", '"$1"'],
            ["default_subject", '"$1"'],
            ["auth", 'secret_name("$1")'],
            ["reply_to", ""]
        ]
    },
    {
        type: "target",
        kind: "slack",
        kindNeeded: true,
        nameNeeded: true,
        members: [
            ["auth", 'secret_name("$1")'],
            ["reply_to", ""]
        ]
    },
    {
        type: "target",
        kind: "sockeye",
        kindNeeded: true,
        nameNeeded: true,
        members: []
    },
    {
        type: "target",
        kind: "splunk",
        kindNeeded: true,
        nameNeeded: true,
        members: [
            ["endpoint", '"$1"'],
            ["index", '"$1"'],
            ["skip_tls_verify", "${1|true,false|}"],
            ["auth", 'secret_name("$1")'],
            ["reply_to", ""]
        ]
    },
    {
        type: "target",
        kind: "twilio",
        kindNeeded: true,
        nameNeeded: true,
        members: [
            ["default_phone_from", '"$1"'],
            ["default_phone_to", '"$1"'],
            ["auth", 'secret_name("$1")'],
            ["reply_to", ""]
        ]
    },
    {
        type: "target",
        kind: "zendesk",
        kindNeeded: true,
        nameNeeded: true,
        members: [
            ["subdomain", '"$1"'],
            ["email", '"$1"'],
            ["api_auth", 'secret_name("$1")'],
            ["subject", '"$1"'],
            ["reply_to", ""]
        ]
    }
];

/**
 * https://github.com/triggermesh/bridgedl/wiki
 */
export const schemas: readonly BlockSchema[] = [
    ...bridges,
    ...channels,
    ...routers,
    ...sources,
    ...transformers,
    ...targets
];
