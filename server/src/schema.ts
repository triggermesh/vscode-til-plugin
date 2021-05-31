export enum AttributeType {
    Custom = "custom",
    Boolean = "boolean",
    Number = "number",
    Void = "void",
    String = "string",
    Tuple = "tuple",
    Object = "object"
}

export interface BaseAttributeSchema {
    attributeType: AttributeType;
    name: string;
    documentation?: string;
}

export interface PrimitiveAttributeSchema extends BaseAttributeSchema {
    attributeType: AttributeType.Boolean | AttributeType.Number | AttributeType.Void;
}

export interface StringAttributeSchema extends BaseAttributeSchema {
    attributeType: AttributeType.String;
    options?: string[];
}

export interface TupleAttributeSchema extends BaseAttributeSchema {
    attributeType: AttributeType.Tuple;
    elements?: string[];
}

export interface ObjectAttributeSchema extends BaseAttributeSchema {
    attributeType: AttributeType.Object;
}

export interface CustomAttributeSchema extends BaseAttributeSchema {
    attributeType: AttributeType.Custom;
    snippet: string;
}

export type AttributeSchema =
    | PrimitiveAttributeSchema
    | StringAttributeSchema
    | TupleAttributeSchema
    | ObjectAttributeSchema
    | CustomAttributeSchema;

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
        kind: "point_to_point",
        kindNeeded: true,
        nameNeeded: true,
        members: [
            {
                type: "delivery",
                kindNeeded: false,
                nameNeeded: false,
                members: [
                    {
                        attributeType: AttributeType.Number,
                        name: "retries"
                    },
                    {
                        attributeType: AttributeType.Void,
                        name: "dead_letter_sink"
                    }
                ]
            },
            {
                attributeType: AttributeType.Void,
                name: "to"
            }
        ]
    },
    {
        type: "channel",
        kind: "pubsub",
        kindNeeded: true,
        nameNeeded: true,
        members: [
            {
                attributeType: AttributeType.Tuple,
                name: "subscribers"
            }
        ]
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
                    {
                        attributeType: AttributeType.Object,
                        name: "attributes"
                    },
                    {
                        attributeType: AttributeType.String,
                        name: "condition"
                    },
                    {
                        attributeType: AttributeType.Void,
                        name: "to"
                    }
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
            {
                attributeType: AttributeType.String,
                name: "condition",
                documentation: "Filtering expression"
            },
            {
                attributeType: AttributeType.Void,
                name: "to",
                documentation: "Routing destination"
            }
        ],
        documentation: "Router, filtering by certain expression"
    },
    {
        type: "router",
        kind: "splitter",
        kindNeeded: true,
        nameNeeded: true,
        members: [
            {
                attributeType: AttributeType.String,
                name: "path"
            },
            {
                type: "ce_context",
                kindNeeded: false,
                nameNeeded: false,
                members: [
                    {
                        attributeType: AttributeType.String,
                        name: "type"
                    },
                    {
                        attributeType: AttributeType.String,
                        name: "source"
                    },
                    {
                        attributeType: AttributeType.Object,
                        name: "extensions"
                    }
                ],
                documentation: "Context"
            },
            {
                attributeType: AttributeType.Void,
                name: "to",
                documentation: "Routing destination"
            }
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
            {
                attributeType: AttributeType.String,
                name: "region"
            },
            {
                attributeType: AttributeType.String,
                name: "polling_interval"
            },
            {
                type: "metric_query",
                kindNeeded: false,
                nameNeeded: true,
                members: [
                    {
                        attributeType: AttributeType.String,
                        name: "expression"
                    },
                    {
                        type: "metric",
                        kindNeeded: false,
                        nameNeeded: false,
                        members: [
                            {
                                attributeType: AttributeType.Number,
                                name: "period"
                            },
                            {
                                attributeType: AttributeType.String,
                                name: "stat"
                            },
                            {
                                attributeType: AttributeType.String,
                                name: "unit"
                            },
                            {
                                attributeType: AttributeType.String,
                                name: "name"
                            },
                            {
                                attributeType: AttributeType.String,
                                name: "namespace"
                            },
                            {
                                type: "dimension",
                                kindNeeded: false,
                                nameNeeded: true,
                                members: [
                                    {
                                        attributeType: AttributeType.String,
                                        name: "value"
                                    }
                                ]
                            }
                        ]
                    }
                ]
            },
            {
                attributeType: AttributeType.Custom,
                name: "credentials",
                snippet: 'secret_name("$1")'
            },
            {
                attributeType: AttributeType.Void,
                name: "to"
            }
        ]
    },
    {
        type: "source",
        kind: "aws_cloudwatch_logs",
        kindNeeded: true,
        nameNeeded: true,
        members: [
            {
                attributeType: AttributeType.String,
                name: "arn"
            },
            {
                attributeType: AttributeType.String,
                name: "polling_interval"
            },
            {
                attributeType: AttributeType.Custom,
                name: "credentials",
                snippet: 'secret_name("$1")'
            },
            {
                attributeType: AttributeType.Void,
                name: "to"
            }
        ]
    },
    {
        type: "source",
        kind: "aws_codecommit",
        kindNeeded: true,
        nameNeeded: true,
        members: [
            {
                attributeType: AttributeType.String,
                name: "arn"
            },
            {
                attributeType: AttributeType.String,
                name: "branch"
            },
            {
                attributeType: AttributeType.Tuple,
                name: "event_types"
            },
            {
                attributeType: AttributeType.Custom,
                name: "credentials",
                snippet: 'secret_name("$1")'
            },
            {
                attributeType: AttributeType.Void,
                name: "to"
            }
        ]
    },
    {
        type: "source",
        kind: "aws_cognito_userpool",
        kindNeeded: true,
        nameNeeded: true,
        members: [
            {
                attributeType: AttributeType.String,
                name: "arn"
            },
            {
                attributeType: AttributeType.Custom,
                name: "credentials",
                snippet: 'secret_name("$1")'
            },
            {
                attributeType: AttributeType.Void,
                name: "to"
            }
        ]
    },
    {
        type: "source",
        kind: "aws_dynamodb",
        kindNeeded: true,
        nameNeeded: true,
        members: [
            {
                attributeType: AttributeType.String,
                name: "arn"
            },
            {
                attributeType: AttributeType.Custom,
                name: "credentials",
                snippet: 'secret_name("$1")'
            },
            {
                attributeType: AttributeType.Void,
                name: "to"
            }
        ]
    },
    {
        type: "source",
        kind: "aws_kinesis",
        kindNeeded: true,
        nameNeeded: true,
        members: [
            {
                attributeType: AttributeType.String,
                name: "arn"
            },
            {
                attributeType: AttributeType.Custom,
                name: "credentials",
                snippet: 'secret_name("$1")'
            },
            {
                attributeType: AttributeType.Void,
                name: "to"
            }
        ]
    },
    {
        type: "source",
        kind: "aws_pi",
        kindNeeded: true,
        nameNeeded: true,
        members: [
            {
                attributeType: AttributeType.String,
                name: "arn"
            },
            {
                attributeType: AttributeType.String,
                name: "polling_interval"
            },
            {
                attributeType: AttributeType.Tuple,
                name: "metric_queries",
                elements: [
                    "db.Cache.Innodb_buffer_pool_pages_data.avg",
                    "db.Cache.Innodb_buffer_pool_pages_total.avg",
                    "db.Cache.Innodb_buffer_pool_read_requests.avg",
                    "db.Cache.Opened_table_definitions.avg",
                    "db.Cache.Opened_tables.avg",
                    "db.Cache.Qcache_hits.avg",
                    "db.Cache.innoDB_buffer_pool_hit_rate.avg",
                    "db.Cache.innoDB_buffer_pool_hits.avg",
                    "db.Cache.innoDB_buffer_pool_usage.avg",
                    "db.Cache.innodb_buffer_pool_reads.avg",
                    "db.Cache.query_cache_hit_rate.avg",
                    "db.Locks.Table_locks_immediate.avg",
                    "db.Locks.Table_locks_waited.avg",
                    "db.Locks.innodb_lock_timeouts.avg",
                    "db.Locks.innodb_row_lock_time.avg",
                    "db.Locks.innodb_row_lock_waits.avg",
                    "db.SQL.Com_analyze.avg",
                    "db.SQL.Com_select.avg",
                    "db.SQL.Innodb_rows_inserted.avg",
                    "db.SQL.Innodb_rows_read.avg",
                    "db.SQL.Innodb_rows_updated.avg",
                    "db.SQL.Questions.avg",
                    "db.SQL.SQL.Com_optimize.avg",
                    "db.SQL.Select_full_join.avg",
                    "db.SQL.Select_full_range_join.avg",
                    "db.SQL.Select_range.avg",
                    "db.SQL.Select_range_check.avg",
                    "db.SQL.Select_scan.avg",
                    "db.SQL.Slow_queries.avg",
                    "db.SQL.Sort_merge_passes.avg",
                    "db.SQL.Sort_range.avg",
                    "db.SQL.Sort_rows.avg",
                    "db.SQL.Sort_scan.avg",
                    "db.SQL.innodb_rows_changed.avg",
                    "db.SQL.innodb_rows_deleted.avg",
                    "db.Temp.Created_tmp.Tables.avg",
                    "db.Temp.Created_tmp_disk_tables.avg",
                    "db.Transactions.active_transactions.avg",
                    "db.Users.Aborted_clients.avg",
                    "db.Users.Aborted_connects.avg",
                    "db.Users.Connections.avg",
                    "db.Users.Threads_created.avg",
                    "db.Users.Threads_running.avg",
                    "os.cpuUtilization.guest.avg",
                    "os.cpuUtilization.idle.avg",
                    "os.cpuUtilization.irq.avg",
                    "os.cpuUtilization.nice.avg",
                    "os.cpuUtilization.steal.avg",
                    "os.cpuUtilization.system.avg",
                    "os.cpuUtilization.total.avg",
                    "os.cpuUtilization.user.avg",
                    "os.cpuUtilization.wait.avg",
                    "os.diskIO.avgQueueLen.avg",
                    "os.diskIO.avgReqSz.avg",
                    "os.diskIO.await.avg",
                    "os.diskIO.readIOsPS.avg",
                    "os.diskIO.readKB.avg",
                    "os.diskIO.readKbPs.avg",
                    "os.diskIO.rrqmPS.avg",
                    "os.diskIO.tps.avg",
                    "os.diskIO.util.avg",
                    "os.diskIO.writeIOsPS.avg",
                    "os.diskIO.writeKb.avg",
                    "os.diskIO.writeKbPs.avg",
                    "os.diskIO.wrqmPS.avg",
                    "os.fileSys.maxFiles.avg",
                    "os.fileSys.total.avg",
                    "os.fileSys.used.avg",
                    "os.fileSys.usedFilePercent.avg",
                    "os.fileSys.usedFiles.avg",
                    "os.fileSys.usedPercent.avg",
                    "os.general.numVCPUs.avg",
                    "os.loadAverageMinute.fifteen.avg",
                    "os.loadaverageMinute.five.avg",
                    "os.loadaverageMinute.one.avg",
                    "os.memory.active.avg",
                    "os.memory.buffers.avg",
                    "os.memory.cached.avg",
                    "os.memory.dirty.avg",
                    "os.memory.free.avg",
                    "os.memory.hugePagesFree.avg",
                    "os.memory.hugePagesRsvd.avg",
                    "os.memory.hugePagesSize.avg",
                    "os.memory.hugePagesSurp.avg",
                    "os.memory.hugePagesTotal.avg",
                    "os.memory.inactive.avg",
                    "os.memory.mapped.avg",
                    "os.memory.pageTables.avg",
                    "os.memory.slab.avg",
                    "os.memory.total.avg",
                    "os.memory.writeback.avg",
                    "os.network.rx.avg",
                    "os.network.tx.avg",
                    "os.swap.free.avg",
                    "os.swap.in.avg",
                    "os.swap.out.avg",
                    "os.swap.total.avg",
                    "os.tasks.blocked.avg",
                    "os.tasks.running.avg",
                    "os.tasks.sleeping.avg",
                    "os.tasks.stopped.avg",
                    "os.tasks.total.avg",
                    "os.tasks.zombie.avg"
                ]
            },
            {
                attributeType: AttributeType.Custom,
                name: "credentials",
                snippet: 'secret_name("$1")'
            },
            {
                attributeType: AttributeType.Void,
                name: "to"
            }
        ]
    },
    {
        type: "source",
        kind: "aws_s3",
        kindNeeded: true,
        nameNeeded: true,
        members: [
            {
                attributeType: AttributeType.String,
                name: "arn"
            },
            {
                attributeType: AttributeType.Tuple,
                name: "event_types",
                elements: [
                    "s3:ObjectCreated:*",
                    "s3:ObjectCreated:Put",
                    "s3:ObjectCreated:Post",
                    "s3:ObjectCreated:Copy",
                    "s3:ObjectCreated:CompleteMultipartUpload",
                    "s3:ObjectRemoved:*",
                    "s3:ObjectRemoved:Delete",
                    "s3:ObjectRemoved:DeleteMarkerCreated",
                    "s3:ObjectRestore:*",
                    "s3:ObjectRestore:Post",
                    "s3:ObjectRestore:Completed",
                    "s3:ReducedRedundancyLostObject",
                    "s3:Replication:*",
                    "s3:Replication:OperationFailedReplication",
                    "s3:Replication:OperationNotTracked",
                    "s3:Replication:OperationMissedThreshold",
                    "s3:Replication:OperationReplicatedAfterThreshold"
                ]
            },
            {
                attributeType: AttributeType.Custom,
                name: "credentials",
                snippet: 'secret_name("$1")'
            },
            {
                attributeType: AttributeType.Void,
                name: "to"
            }
        ]
    },
    {
        type: "source",
        kind: "aws_sns",
        kindNeeded: true,
        nameNeeded: true,
        members: [
            {
                attributeType: AttributeType.String,
                name: "arn"
            },
            {
                attributeType: AttributeType.Custom,
                name: "credentials",
                snippet: 'secret_name("$1")'
            },
            {
                attributeType: AttributeType.Void,
                name: "to"
            }
        ]
    },
    {
        type: "source",
        kind: "aws_sqs",
        kindNeeded: true,
        nameNeeded: true,
        members: [
            {
                attributeType: AttributeType.String,
                name: "arn"
            },
            {
                attributeType: AttributeType.Custom,
                name: "credentials",
                snippet: 'secret_name("$1")'
            },
            {
                attributeType: AttributeType.Void,
                name: "to"
            }
        ]
    },
    {
        type: "source",
        kind: "azure_activity_logs",
        kindNeeded: true,
        nameNeeded: true,
        members: [
            {
                attributeType: AttributeType.String,
                name: "event_hub_id"
            },
            {
                attributeType: AttributeType.String,
                name: "event_hubs_sas_policy"
            },
            {
                attributeType: AttributeType.Tuple,
                name: "categories"
            },
            {
                attributeType: AttributeType.Custom,
                name: "auth",
                snippet: 'secret_name("$1")'
            },
            {
                attributeType: AttributeType.Void,
                name: "to"
            }
        ]
    },
    {
        type: "source",
        kind: "azure_blob_storage",
        kindNeeded: true,
        nameNeeded: true,
        members: [
            {
                attributeType: AttributeType.String,
                name: "storage_account_id"
            },
            {
                attributeType: AttributeType.String,
                name: "event_hub_id"
            },
            {
                attributeType: AttributeType.Tuple,
                name: "event_types",
                elements: [
                    "Microsoft.Storage.BlobCreated",
                    "Microsoft.Storage.BlobDeleted",
                    "Microsoft.Storage.BlobRenamed",
                    "Microsoft.Storage.DirectoryCreated",
                    "Microsoft.Storage.DirectoryDeleted",
                    "Microsoft.Storage.DirectoryRenamed"
                ]
            },
            {
                attributeType: AttributeType.Custom,
                name: "auth",
                snippet: 'secret_name("$1")'
            },
            {
                attributeType: AttributeType.Void,
                name: "to"
            }
        ]
    },
    {
        type: "source",
        kind: "azure_event_hubs",
        kindNeeded: true,
        nameNeeded: true,
        members: [
            {
                attributeType: AttributeType.String,
                name: "hub_namespace"
            },
            {
                attributeType: AttributeType.String,
                name: "hub_name"
            },
            {
                attributeType: AttributeType.Custom,
                name: "auth",
                snippet: 'secret_name("$1")'
            },
            {
                attributeType: AttributeType.Void,
                name: "to"
            }
        ]
    },
    {
        type: "source",
        kind: "github",
        kindNeeded: true,
        nameNeeded: true,
        members: [
            {
                attributeType: AttributeType.String,
                name: "owner_and_repository"
            },
            {
                attributeType: AttributeType.Tuple,
                name: "event_types",
                elements: [
                    "check_suite",
                    "commit_comment",
                    "create",
                    "delete",
                    "deployment",
                    "deployment_status",
                    "fork",
                    "gollum",
                    "installation",
                    "integration_installation",
                    "issue_comment",
                    "issues",
                    "label",
                    "member",
                    "membership",
                    "milestone",
                    "organization",
                    "org_block",
                    "page_build",
                    "ping",
                    "project_card",
                    "project_column",
                    "project",
                    "public",
                    "pull_request",
                    "pull_request_review",
                    "pull_request_review_comment",
                    "push",
                    "release",
                    "repository",
                    "status",
                    "team",
                    "team_add",
                    "watch"
                ]
            },
            {
                attributeType: AttributeType.Custom,
                name: "tokens",
                snippet: 'secret_name("$1")'
            },
            {
                attributeType: AttributeType.Void,
                name: "to"
            }
        ]
    },
    {
        type: "source",
        kind: "httppoller",
        kindNeeded: true,
        nameNeeded: true,
        members: [
            {
                attributeType: AttributeType.String,
                name: "endpoint"
            },
            {
                attributeType: AttributeType.String,
                name: "method"
            },
            {
                attributeType: AttributeType.String,
                name: "interval"
            },
            {
                attributeType: AttributeType.String,
                name: "event_type"
            },
            {
                attributeType: AttributeType.String,
                name: "event_source"
            },
            {
                attributeType: AttributeType.Void,
                name: "to"
            }
        ]
    },
    {
        type: "source",
        kind: "kafka",
        kindNeeded: true,
        nameNeeded: true,
        members: [
            {
                attributeType: AttributeType.Tuple,
                name: "topics"
            },
            {
                attributeType: AttributeType.Tuple,
                name: "bootstrap_servers"
            },
            {
                attributeType: AttributeType.String,
                name: "consumer_group"
            },
            {
                attributeType: AttributeType.Custom,
                name: "sasl_auth",
                snippet: 'secret_name("$1")'
            },
            {
                attributeType: AttributeType.Custom,
                name: "tls",
                snippet: '${1|secret_name(""),true|}'
            },
            {
                attributeType: AttributeType.Void,
                name: "to"
            }
        ]
    },
    {
        type: "source",
        kind: "ping",
        kindNeeded: true,
        nameNeeded: true,
        members: [
            {
                attributeType: AttributeType.String,
                name: "data"
            },
            {
                attributeType: AttributeType.String,
                name: "content_type"
            },
            {
                attributeType: AttributeType.String,
                name: "schedule"
            },
            {
                attributeType: AttributeType.Void,
                name: "to"
            }
        ]
    },
    {
        type: "source",
        kind: "salesforce",
        kindNeeded: true,
        nameNeeded: true,
        members: [
            {
                attributeType: AttributeType.String,
                name: "channel"
            },
            {
                attributeType: AttributeType.Number,
                name: "replay_id"
            },
            {
                attributeType: AttributeType.String,
                name: "client_id"
            },
            {
                attributeType: AttributeType.String,
                name: "server"
            },
            {
                attributeType: AttributeType.String,
                name: "user"
            },
            {
                attributeType: AttributeType.Custom,
                name: "secret_key",
                snippet: 'secret_name("$1")'
            },
            {
                attributeType: AttributeType.Void,
                name: "to"
            }
        ]
    },
    {
        type: "source",
        kind: "slack",
        kindNeeded: true,
        nameNeeded: true,
        members: [
            {
                attributeType: AttributeType.Custom,
                name: "signing_secret",
                snippet: 'secret_name("$1")'
            },
            {
                attributeType: AttributeType.String,
                name: "app_id"
            },
            {
                attributeType: AttributeType.Void,
                name: "to"
            }
        ]
    },
    {
        type: "source",
        kind: "webhook",
        kindNeeded: true,
        nameNeeded: true,
        members: [
            {
                attributeType: AttributeType.String,
                name: "event_type"
            },
            {
                attributeType: AttributeType.String,
                name: "event_source"
            },
            {
                attributeType: AttributeType.String,
                name: "basic_auth_username"
            },
            {
                attributeType: AttributeType.String,
                name: "basic_auth_password"
            },
            {
                attributeType: AttributeType.Void,
                name: "to"
            }
        ]
    },
    {
        type: "source",
        kind: "zendesk",
        kindNeeded: true,
        nameNeeded: true,
        members: [
            {
                attributeType: AttributeType.String,
                name: "subdomain"
            },
            {
                attributeType: AttributeType.String,
                name: "email"
            },
            {
                attributeType: AttributeType.Custom,
                name: "api_auth",
                snippet: 'secret_name("$1")'
            },
            {
                attributeType: AttributeType.String,
                name: "webhook_username"
            },
            {
                attributeType: AttributeType.String,
                name: "webhook_password"
            },
            {
                attributeType: AttributeType.Void,
                name: "to"
            }
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
                                    {
                                        attributeType: AttributeType.String,
                                        name: "key"
                                    },
                                    {
                                        attributeType: AttributeType.String,
                                        name: "value"
                                    }
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
                                    {
                                        attributeType: AttributeType.String,
                                        name: "key"
                                    },
                                    {
                                        attributeType: AttributeType.String,
                                        name: "value"
                                    }
                                ]
                            }
                        ]
                    }
                ]
            },
            {
                attributeType: AttributeType.Void,
                name: "to"
            }
        ]
    },
    {
        type: "transformer",
        kind: "function",
        kindNeeded: true,
        nameNeeded: true,
        members: [
            {
                attributeType: AttributeType.String,
                name: "runtime"
            },
            {
                attributeType: AttributeType.String,
                name: "entrypoint"
            },
            {
                attributeType: AttributeType.Boolean,
                name: "public"
            },
            {
                attributeType: AttributeType.Custom,
                name: "code",
                snippet: "<<-EOF\n$1\nEOF"
            },
            {
                type: "ce_context",
                kindNeeded: false,
                nameNeeded: false,
                members: [
                    {
                        attributeType: AttributeType.String,
                        name: "type"
                    },
                    {
                        attributeType: AttributeType.String,
                        name: "source"
                    },
                    {
                        attributeType: AttributeType.String,
                        name: "subject"
                    }
                ]
            },
            {
                attributeType: AttributeType.Void,
                name: "to"
            }
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
            {
                attributeType: AttributeType.String,
                name: "arn"
            },
            {
                attributeType: AttributeType.Custom,
                name: "credentials",
                snippet: 'secret_name("$1")'
            },
            {
                attributeType: AttributeType.Void,
                name: "reply_to"
            }
        ]
    },
    {
        type: "target",
        kind: "aws_kinesis",
        kindNeeded: true,
        nameNeeded: true,
        members: [
            {
                attributeType: AttributeType.String,
                name: "arn"
            },
            {
                attributeType: AttributeType.String,
                name: "partition"
            },
            {
                attributeType: AttributeType.Custom,
                name: "credentials",
                snippet: 'secret_name("$1")'
            },
            {
                attributeType: AttributeType.Void,
                name: "reply_to"
            }
        ]
    },
    {
        type: "target",
        kind: "aws_lambda",
        kindNeeded: true,
        nameNeeded: true,
        members: [
            {
                attributeType: AttributeType.String,
                name: "arn"
            },
            {
                attributeType: AttributeType.Custom,
                name: "credentials",
                snippet: 'secret_name("$1")'
            },
            {
                attributeType: AttributeType.Void,
                name: "reply_to"
            }
        ]
    },
    {
        type: "target",
        kind: "aws_s3",
        kindNeeded: true,
        nameNeeded: true,
        members: [
            {
                attributeType: AttributeType.String,
                name: "arn"
            },
            {
                attributeType: AttributeType.Custom,
                name: "credentials",
                snippet: 'secret_name("$1")'
            },
            {
                attributeType: AttributeType.Void,
                name: "reply_to"
            }
        ]
    },
    {
        type: "target",
        kind: "aws_sns",
        kindNeeded: true,
        nameNeeded: true,
        members: [
            {
                attributeType: AttributeType.String,
                name: "arn"
            },
            {
                attributeType: AttributeType.Custom,
                name: "credentials",
                snippet: 'secret_name("$1")'
            },
            {
                attributeType: AttributeType.Void,
                name: "reply_to"
            }
        ]
    },
    {
        type: "target",
        kind: "aws_sqs",
        kindNeeded: true,
        nameNeeded: true,
        members: [
            {
                attributeType: AttributeType.String,
                name: "arn"
            },
            {
                attributeType: AttributeType.Custom,
                name: "credentials",
                snippet: 'secret_name("$1")'
            },
            {
                attributeType: AttributeType.Void,
                name: "reply_to"
            }
        ]
    },
    {
        type: "target",
        kind: "container",
        kindNeeded: true,
        nameNeeded: true,
        members: [
            {
                attributeType: AttributeType.String,
                name: "image"
            },
            {
                attributeType: AttributeType.Boolean,
                name: "public"
            },
            {
                type: "env_var",
                kindNeeded: false,
                nameNeeded: true,
                members: [
                    {
                        attributeType: AttributeType.String,
                        name: "value"
                    }
                ]
            },
            {
                attributeType: AttributeType.Object,
                name: "env_vars"
            }
        ]
    },
    {
        type: "target",
        kind: "datadog",
        kindNeeded: true,
        nameNeeded: true,
        members: [
            {
                attributeType: AttributeType.String,
                name: "metric_prefix"
            },
            {
                attributeType: AttributeType.Custom,
                name: "auth",
                snippet: 'secret_name("$1")'
            },
            {
                attributeType: AttributeType.Void,
                name: "reply_to"
            }
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
            {
                attributeType: AttributeType.String,
                name: "runtime"
            },
            {
                attributeType: AttributeType.String,
                name: "entrypoint"
            },
            {
                attributeType: AttributeType.Boolean,
                name: "public"
            },
            {
                attributeType: AttributeType.Custom,
                name: "code",
                snippet: "<<-EOF\n$1\nEOF"
            },
            {
                type: "ce_context",
                kindNeeded: false,
                nameNeeded: false,
                members: [
                    {
                        attributeType: AttributeType.String,
                        name: "type"
                    },
                    {
                        attributeType: AttributeType.String,
                        name: "source"
                    },
                    {
                        attributeType: AttributeType.String,
                        name: "subject"
                    }
                ]
            },
            {
                attributeType: AttributeType.Void,
                name: "reply_to"
            }
        ]
    },
    {
        type: "target",
        kind: "gcloud_storage",
        kindNeeded: true,
        nameNeeded: true,
        members: [
            {
                attributeType: AttributeType.String,
                name: "bucket_name"
            },
            {
                attributeType: AttributeType.Custom,
                name: "service_account",
                snippet: 'secret_name("$1")'
            },
            {
                attributeType: AttributeType.Void,
                name: "reply_to"
            }
        ]
    },
    {
        type: "target",
        kind: "kafka",
        kindNeeded: true,
        nameNeeded: true,
        members: [
            {
                attributeType: AttributeType.String,
                name: "topic"
            },
            {
                attributeType: AttributeType.Tuple,
                name: "bootstrap_servers"
            },
            {
                attributeType: AttributeType.Custom,
                name: "auth",
                snippet: 'secret_name("$1")'
            },
            {
                attributeType: AttributeType.Void,
                name: "reply_to"
            }
        ]
    },
    {
        type: "target",
        kind: "logz",
        kindNeeded: true,
        nameNeeded: true,
        members: [
            {
                attributeType: AttributeType.String,
                name: "logs_listener_url"
            },
            {
                attributeType: AttributeType.Custom,
                name: "auth",
                snippet: 'secret_name("$1")'
            },
            {
                attributeType: AttributeType.Void,
                name: "reply_to"
            }
        ]
    },
    {
        type: "target",
        kind: "sendgrid",
        kindNeeded: true,
        nameNeeded: true,
        members: [
            {
                attributeType: AttributeType.String,
                name: "default_from_email"
            },
            {
                attributeType: AttributeType.String,
                name: "default_from_name"
            },
            {
                attributeType: AttributeType.String,
                name: "default_to_email"
            },
            {
                attributeType: AttributeType.String,
                name: "default_to_name"
            },
            {
                attributeType: AttributeType.String,
                name: "default_subject"
            },
            {
                attributeType: AttributeType.Custom,
                name: "auth",
                snippet: 'secret_name("$1")'
            },
            {
                attributeType: AttributeType.Void,
                name: "reply_to"
            }
        ]
    },
    {
        type: "target",
        kind: "slack",
        kindNeeded: true,
        nameNeeded: true,
        members: [
            {
                attributeType: AttributeType.Custom,
                name: "auth",
                snippet: 'secret_name("$1")'
            },
            {
                attributeType: AttributeType.Void,
                name: "reply_to"
            }
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
            {
                attributeType: AttributeType.String,
                name: "endpoint"
            },
            {
                attributeType: AttributeType.String,
                name: "index"
            },
            {
                attributeType: AttributeType.Boolean,
                name: "skip_tls_verify"
            },
            {
                attributeType: AttributeType.Custom,
                name: "auth",
                snippet: 'secret_name("$1")'
            },
            {
                attributeType: AttributeType.Void,
                name: "reply_to"
            }
        ]
    },
    {
        type: "target",
        kind: "twilio",
        kindNeeded: true,
        nameNeeded: true,
        members: [
            {
                attributeType: AttributeType.String,
                name: "default_phone_from"
            },
            {
                attributeType: AttributeType.String,
                name: "default_phone_to"
            },
            {
                attributeType: AttributeType.Custom,
                name: "auth",
                snippet: 'secret_name("$1")'
            },
            {
                attributeType: AttributeType.Void,
                name: "reply_to"
            }
        ]
    },
    {
        type: "target",
        kind: "zendesk",
        kindNeeded: true,
        nameNeeded: true,
        members: [
            {
                attributeType: AttributeType.String,
                name: "subdomain"
            },
            {
                attributeType: AttributeType.String,
                name: "email"
            },
            {
                attributeType: AttributeType.Custom,
                name: "api_auth",
                snippet: 'secret_name("$1")'
            },
            {
                attributeType: AttributeType.String,
                name: "subject"
            },
            {
                attributeType: AttributeType.Void,
                name: "reply_to"
            }
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
