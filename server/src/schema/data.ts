import { BlockSchema, ValueType } from "./types";

/**
 * https://github.com/triggermesh/vscode-til-plugin/wiki
 */
export const bridges: readonly BlockSchema[] = [
    {
        type: "bridge",
        kindNeeded: false,
        nameNeeded: true
    }
];

/**
 * https://github.com/triggermesh/vscode-til-plugin/wiki/Channels
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
                        name: "retries",
                        value: { type: ValueType.Number }
                    },
                    {
                        name: "dead_letter_sink",
                        value: { type: ValueType.ComponentReference }
                    }
                ]
            },
            {
                name: "to",
                value: { type: ValueType.ComponentReference }
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
                name: "subscribers",
                value: { type: ValueType.Tuple }
            }
        ]
    }
];

/**
 * https://github.com/triggermesh/vscode-til-plugin/wiki/Routers
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
                        name: "attributes",
                        value: { type: ValueType.Object }
                    },
                    {
                        name: "condition",
                        value: { type: ValueType.String }
                    },
                    {
                        name: "to",
                        value: { type: ValueType.ComponentReference }
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
                name: "condition",
                value: { type: ValueType.String },
                documentation: "Filtering expression"
            },
            {
                name: "to",
                value: { type: ValueType.ComponentReference },
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
                name: "path",
                value: { type: ValueType.String }
            },
            {
                type: "ce_context",
                kindNeeded: false,
                nameNeeded: false,
                members: [
                    {
                        name: "type",
                        value: { type: ValueType.String }
                    },
                    {
                        name: "source",
                        value: { type: ValueType.String }
                    },
                    {
                        name: "extensions",
                        value: { type: ValueType.Object }
                    }
                ],
                documentation: "Context"
            },
            {
                name: "to",
                value: { type: ValueType.ComponentReference },
                documentation: "Routing destination"
            }
        ],
        documentation: "Splitting router"
    }
];

/**
 * https://github.com/triggermesh/vscode-til-plugin/wiki/Sources
 */
export const sources: readonly BlockSchema[] = [
    {
        type: "source",
        kind: "aws_cloudwatch",
        kindNeeded: true,
        nameNeeded: true,
        members: [
            {
                name: "region",
                value: { type: ValueType.String }
            },
            {
                name: "polling_interval",
                value: { type: ValueType.String }
            },
            {
                type: "metric_query",
                kindNeeded: false,
                nameNeeded: true,
                members: [
                    {
                        name: "expression",
                        value: { type: ValueType.String }
                    },
                    {
                        type: "metric",
                        kindNeeded: false,
                        nameNeeded: false,
                        members: [
                            {
                                name: "period",
                                value: { type: ValueType.Number }
                            },
                            {
                                name: "stat",
                                value: { type: ValueType.String }
                            },
                            {
                                name: "unit",
                                value: { type: ValueType.String }
                            },
                            {
                                name: "name",
                                value: { type: ValueType.String }
                            },
                            {
                                name: "namespace",
                                value: { type: ValueType.String }
                            },
                            {
                                type: "dimension",
                                kindNeeded: false,
                                nameNeeded: true,
                                members: [
                                    {
                                        name: "value",
                                        value: { type: ValueType.String }
                                    }
                                ]
                            }
                        ]
                    }
                ]
            },
            {
                name: "credentials",
                value: {
                    type: ValueType.Custom,
                    snippet: 'secret_name("$1")'
                }
            },
            {
                name: "to",
                value: { type: ValueType.ComponentReference }
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
                name: "arn",
                value: { type: ValueType.String }
            },
            {
                name: "polling_interval",
                value: { type: ValueType.String }
            },
            {
                name: "credentials",
                value: {
                    type: ValueType.Custom,
                    snippet: 'secret_name("$1")'
                }
            },
            {
                name: "to",
                value: { type: ValueType.ComponentReference }
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
                name: "arn",
                value: { type: ValueType.String }
            },
            {
                name: "branch",
                value: { type: ValueType.String }
            },
            {
                name: "event_types",
                value: { type: ValueType.Tuple }
            },
            {
                name: "credentials",
                value: {
                    type: ValueType.Custom,
                    snippet: 'secret_name("$1")'
                }
            },
            {
                name: "to",
                value: { type: ValueType.ComponentReference }
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
                name: "arn",
                value: { type: ValueType.String }
            },
            {
                name: "credentials",
                value: {
                    type: ValueType.Custom,
                    snippet: 'secret_name("$1")'
                }
            },
            {
                name: "to",
                value: { type: ValueType.ComponentReference }
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
                name: "arn",
                value: { type: ValueType.String }
            },
            {
                name: "credentials",
                value: {
                    type: ValueType.Custom,
                    snippet: 'secret_name("$1")'
                }
            },
            {
                name: "to",
                value: { type: ValueType.ComponentReference }
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
                name: "arn",
                value: { type: ValueType.String }
            },
            {
                name: "credentials",
                value: {
                    type: ValueType.Custom,
                    snippet: 'secret_name("$1")'
                }
            },
            {
                name: "to",
                value: { type: ValueType.ComponentReference }
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
                name: "arn",
                value: { type: ValueType.String }
            },
            {
                name: "polling_interval",
                value: { type: ValueType.String }
            },
            {
                name: "metric_queries",
                value: {
                    type: ValueType.Tuple,
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
                }
            },
            {
                name: "credentials",
                value: {
                    type: ValueType.Custom,
                    snippet: 'secret_name("$1")'
                }
            },
            {
                name: "to",
                value: { type: ValueType.ComponentReference }
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
                name: "arn",
                value: { type: ValueType.String }
            },
            {
                name: "event_types",
                value: {
                    type: ValueType.Tuple,
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
                }
            },
            {
                name: "credentials",
                value: {
                    type: ValueType.Custom,
                    snippet: 'secret_name("$1")'
                }
            },
            {
                name: "to",
                value: { type: ValueType.ComponentReference }
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
                name: "arn",
                value: { type: ValueType.String }
            },
            {
                name: "credentials",
                value: {
                    type: ValueType.Custom,
                    snippet: 'secret_name("$1")'
                }
            },
            {
                name: "to",
                value: { type: ValueType.ComponentReference }
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
                name: "arn",
                value: { type: ValueType.String }
            },
            {
                name: "credentials",
                value: {
                    type: ValueType.Custom,
                    snippet: 'secret_name("$1")'
                }
            },
            {
                name: "to",
                value: { type: ValueType.ComponentReference }
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
                name: "event_hub_id",
                value: { type: ValueType.String }
            },
            {
                name: "event_hubs_sas_policy",
                value: { type: ValueType.String }
            },
            {
                name: "categories",
                value: { type: ValueType.Tuple }
            },
            {
                name: "auth",
                value: {
                    type: ValueType.Custom,
                    snippet: 'secret_name("$1")'
                }
            },
            {
                name: "to",
                value: { type: ValueType.ComponentReference }
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
                name: "storage_account_id",
                value: { type: ValueType.String }
            },
            {
                name: "event_hub_id",
                value: { type: ValueType.String }
            },
            {
                name: "event_types",
                value: {
                    type: ValueType.Tuple,
                    elements: [
                        "Microsoft.Storage.BlobCreated",
                        "Microsoft.Storage.BlobDeleted",
                        "Microsoft.Storage.BlobRenamed",
                        "Microsoft.Storage.DirectoryCreated",
                        "Microsoft.Storage.DirectoryDeleted",
                        "Microsoft.Storage.DirectoryRenamed"
                    ]
                }
            },
            {
                name: "auth",
                value: {
                    type: ValueType.Custom,
                    snippet: 'secret_name("$1")'
                }
            },
            {
                name: "to",
                value: { type: ValueType.ComponentReference }
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
                name: "hub_namespace",
                value: { type: ValueType.String }
            },
            {
                name: "hub_name",
                value: { type: ValueType.String }
            },
            {
                name: "auth",
                value: {
                    type: ValueType.Custom,
                    snippet: 'secret_name("$1")'
                }
            },
            {
                name: "to",
                value: { type: ValueType.ComponentReference }
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
                name: "owner_and_repository",
                value: { type: ValueType.String }
            },
            {
                name: "event_types",
                value: {
                    type: ValueType.Tuple,
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
                }
            },
            {
                name: "tokens",
                value: {
                    type: ValueType.Custom,
                    snippet: 'secret_name("$1")'
                }
            },
            {
                name: "to",
                value: { type: ValueType.ComponentReference }
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
                name: "endpoint",
                value: { type: ValueType.String }
            },
            {
                name: "method",
                value: { type: ValueType.String }
            },
            {
                name: "interval",
                value: { type: ValueType.String }
            },
            {
                name: "event_type",
                value: { type: ValueType.String }
            },
            {
                name: "event_source",
                value: { type: ValueType.String }
            },
            {
                name: "to",
                value: { type: ValueType.ComponentReference }
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
                name: "topics",
                value: { type: ValueType.Tuple }
            },
            {
                name: "bootstrap_servers",
                value: { type: ValueType.Tuple }
            },
            {
                name: "consumer_group",
                value: { type: ValueType.String }
            },
            {
                name: "sasl_auth",
                value: {
                    type: ValueType.Custom,
                    snippet: 'secret_name("$1")'
                }
            },
            {
                name: "tls",
                value: {
                    type: ValueType.Custom,
                    snippet: '${1|secret_name(""),true|}'
                }
            },
            {
                name: "to",
                value: { type: ValueType.ComponentReference }
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
                name: "data",
                value: { type: ValueType.String }
            },
            {
                name: "content_type",
                value: { type: ValueType.String }
            },
            {
                name: "schedule",
                value: { type: ValueType.String }
            },
            {
                name: "to",
                value: { type: ValueType.ComponentReference }
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
                name: "channel",
                value: { type: ValueType.String }
            },
            {
                name: "replay_id",
                value: { type: ValueType.Number }
            },
            {
                name: "client_id",
                value: { type: ValueType.String }
            },
            {
                name: "server",
                value: { type: ValueType.String }
            },
            {
                name: "user",
                value: { type: ValueType.String }
            },
            {
                name: "secret_key",
                value: {
                    type: ValueType.Custom,
                    snippet: 'secret_name("$1")'
                }
            },
            {
                name: "to",
                value: { type: ValueType.ComponentReference }
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
                name: "signing_secret",
                value: {
                    type: ValueType.Custom,
                    snippet: 'secret_name("$1")'
                }
            },
            {
                name: "app_id",
                value: { type: ValueType.String }
            },
            {
                name: "to",
                value: { type: ValueType.ComponentReference }
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
                name: "event_type",
                value: { type: ValueType.String }
            },
            {
                name: "event_source",
                value: { type: ValueType.String }
            },
            {
                name: "basic_auth_username",
                value: { type: ValueType.String }
            },
            {
                name: "basic_auth_password",
                value: { type: ValueType.String }
            },
            {
                name: "to",
                value: { type: ValueType.ComponentReference }
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
                name: "subdomain",
                value: { type: ValueType.String }
            },
            {
                name: "email",
                value: { type: ValueType.String }
            },
            {
                name: "api_auth",
                value: {
                    type: ValueType.Custom,
                    snippet: 'secret_name("$1")'
                }
            },
            {
                name: "webhook_username",
                value: { type: ValueType.String }
            },
            {
                name: "webhook_password",
                value: { type: ValueType.String }
            },
            {
                name: "to",
                value: { type: ValueType.ComponentReference }
            }
        ]
    }
];

/**
 * https://github.com/triggermesh/vscode-til-plugin/wiki/Transformers
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
                                        name: "key",
                                        value: { type: ValueType.String }
                                    },
                                    {
                                        name: "value",
                                        value: { type: ValueType.String }
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
                                        name: "key",
                                        value: { type: ValueType.String }
                                    },
                                    {
                                        name: "value",
                                        value: { type: ValueType.String }
                                    }
                                ]
                            }
                        ]
                    }
                ]
            },
            {
                name: "to",
                value: { type: ValueType.ComponentReference }
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
                name: "runtime",
                value: { type: ValueType.String }
            },
            {
                name: "entrypoint",
                value: { type: ValueType.String }
            },
            {
                name: "public",
                value: { type: ValueType.Boolean }
            },
            {
                name: "code",
                value: {
                    type: ValueType.Custom,
                    snippet: "<<-EOF\n$1\nEOF"
                }
            },
            {
                type: "ce_context",
                kindNeeded: false,
                nameNeeded: false,
                members: [
                    {
                        name: "type",
                        value: { type: ValueType.String }
                    },
                    {
                        name: "source",
                        value: { type: ValueType.String }
                    },
                    {
                        name: "subject",
                        value: { type: ValueType.String }
                    }
                ]
            },
            {
                name: "to",
                value: { type: ValueType.ComponentReference }
            }
        ]
    }
];

/**
 * https://github.com/triggermesh/vscode-til-plugin/wiki/Targets
 */
export const targets: readonly BlockSchema[] = [
    {
        type: "target",
        kind: "aws_dynamodb",
        kindNeeded: true,
        nameNeeded: true,
        members: [
            {
                name: "arn",
                value: { type: ValueType.String }
            },
            {
                name: "credentials",
                value: {
                    type: ValueType.Custom,
                    snippet: 'secret_name("$1")'
                }
            },
            {
                name: "reply_to",
                value: { type: ValueType.ComponentReference }
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
                name: "arn",
                value: { type: ValueType.String }
            },
            {
                name: "partition",
                value: { type: ValueType.String }
            },
            {
                name: "credentials",
                value: {
                    type: ValueType.Custom,
                    snippet: 'secret_name("$1")'
                }
            },
            {
                name: "reply_to",
                value: { type: ValueType.ComponentReference }
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
                name: "arn",
                value: { type: ValueType.String }
            },
            {
                name: "credentials",
                value: {
                    type: ValueType.Custom,
                    snippet: 'secret_name("$1")'
                }
            },
            {
                name: "reply_to",
                value: { type: ValueType.ComponentReference }
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
                name: "arn",
                value: { type: ValueType.String }
            },
            {
                name: "credentials",
                value: {
                    type: ValueType.Custom,
                    snippet: 'secret_name("$1")'
                }
            },
            {
                name: "reply_to",
                value: { type: ValueType.ComponentReference }
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
                name: "arn",
                value: { type: ValueType.String }
            },
            {
                name: "credentials",
                value: {
                    type: ValueType.Custom,
                    snippet: 'secret_name("$1")'
                }
            },
            {
                name: "reply_to",
                value: { type: ValueType.ComponentReference }
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
                name: "arn",
                value: { type: ValueType.String }
            },
            {
                name: "credentials",
                value: {
                    type: ValueType.Custom,
                    snippet: 'secret_name("$1")'
                }
            },
            {
                name: "reply_to",
                value: { type: ValueType.ComponentReference }
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
                name: "image",
                value: { type: ValueType.String }
            },
            {
                name: "public",
                value: { type: ValueType.Boolean }
            },
            {
                type: "env_var",
                kindNeeded: false,
                nameNeeded: true,
                members: [
                    {
                        name: "value",
                        value: { type: ValueType.String }
                    }
                ]
            },
            {
                name: "env_vars",
                value: { type: ValueType.Object }
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
                name: "metric_prefix",
                value: { type: ValueType.String }
            },
            {
                name: "auth",
                value: {
                    type: ValueType.Custom,
                    snippet: 'secret_name("$1")'
                }
            },
            {
                name: "reply_to",
                value: { type: ValueType.ComponentReference }
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
                name: "runtime",
                value: { type: ValueType.String }
            },
            {
                name: "entrypoint",
                value: { type: ValueType.String }
            },
            {
                name: "public",
                value: { type: ValueType.Boolean }
            },
            {
                name: "code",
                value: {
                    type: ValueType.Custom,
                    snippet: "<<-EOF\n$1\nEOF"
                }
            },
            {
                type: "ce_context",
                kindNeeded: false,
                nameNeeded: false,
                members: [
                    {
                        name: "type",
                        value: { type: ValueType.String }
                    },
                    {
                        name: "source",
                        value: { type: ValueType.String }
                    },
                    {
                        name: "subject",
                        value: { type: ValueType.String }
                    }
                ]
            },
            {
                name: "reply_to",
                value: { type: ValueType.ComponentReference }
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
                name: "bucket_name",
                value: { type: ValueType.String }
            },
            {
                name: "service_account",
                value: {
                    type: ValueType.Custom,
                    snippet: 'secret_name("$1")'
                }
            },
            {
                name: "reply_to",
                value: { type: ValueType.ComponentReference }
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
                name: "topic",
                value: { type: ValueType.String }
            },
            {
                name: "bootstrap_servers",
                value: { type: ValueType.Tuple }
            },
            {
                name: "auth",
                value: {
                    type: ValueType.Custom,
                    snippet: 'secret_name("$1")'
                }
            },
            {
                name: "reply_to",
                value: { type: ValueType.ComponentReference }
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
                name: "logs_listener_url",
                value: { type: ValueType.String }
            },
            {
                name: "auth",
                value: {
                    type: ValueType.Custom,
                    snippet: 'secret_name("$1")'
                }
            },
            {
                name: "reply_to",
                value: { type: ValueType.ComponentReference }
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
                name: "default_from_email",
                value: { type: ValueType.String }
            },
            {
                name: "default_from_name",
                value: { type: ValueType.String }
            },
            {
                name: "default_to_email",
                value: { type: ValueType.String }
            },
            {
                name: "default_to_name",
                value: { type: ValueType.String }
            },
            {
                name: "default_subject",
                value: { type: ValueType.String }
            },
            {
                name: "auth",
                value: {
                    type: ValueType.Custom,
                    snippet: 'secret_name("$1")'
                }
            },
            {
                name: "reply_to",
                value: { type: ValueType.ComponentReference }
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
                name: "auth",
                value: {
                    type: ValueType.Custom,
                    snippet: 'secret_name("$1")'
                }
            },
            {
                name: "reply_to",
                value: { type: ValueType.ComponentReference }
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
                name: "endpoint",
                value: { type: ValueType.String }
            },
            {
                name: "index",
                value: { type: ValueType.String }
            },
            {
                name: "skip_tls_verify",
                value: { type: ValueType.Boolean }
            },
            {
                name: "auth",
                value: {
                    type: ValueType.Custom,
                    snippet: 'secret_name("$1")'
                }
            },
            {
                name: "reply_to",
                value: { type: ValueType.ComponentReference }
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
                name: "default_phone_from",
                value: { type: ValueType.String }
            },
            {
                name: "default_phone_to",
                value: { type: ValueType.String }
            },
            {
                name: "auth",
                value: {
                    type: ValueType.Custom,
                    snippet: 'secret_name("$1")'
                }
            },
            {
                name: "reply_to",
                value: { type: ValueType.ComponentReference }
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
                name: "subdomain",
                value: { type: ValueType.String }
            },
            {
                name: "email",
                value: { type: ValueType.String }
            },
            {
                name: "api_auth",
                value: {
                    type: ValueType.Custom,
                    snippet: 'secret_name("$1")'
                }
            },
            {
                name: "subject",
                value: { type: ValueType.String }
            },
            {
                name: "reply_to",
                value: { type: ValueType.ComponentReference }
            }
        ]
    }
];

/**
 * https://github.com/triggermesh/vscode-til-plugin/wiki
 */
export const schemas: readonly BlockSchema[] = [
    ...bridges,
    ...channels,
    ...routers,
    ...sources,
    ...transformers,
    ...targets
];
