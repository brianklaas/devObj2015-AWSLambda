<!--- Simple example of using cfexecute to invoke a Lambda function via the AWS CLI --->
<!--- Command-line example:
		aws lambda invoke --function-name devObjCustomEvent --payload '{"key1":"value1", "key2":"value2", "key3":"value3"}' outfile.txt
--->

<cfset pathToBashScript = "/Users/brianklaas/Dropbox/Presentations/devObj2015-AWSLambda/lambdaInvoke.sh" />
<cfset pathToOutputFile = "/Users/brianklaas/Dropbox/Presentations/devObj2015-AWSLambda/callResults.txt" />

<!--- ColdFusion 10 and lower upper cases serialization of keys in a structure unless you use array notation to define the keys in the struct. --->
<cfset payload = {} />
<cfset payload["firstName"] = "Brian" />
<cfset payload["lastName"] = "Klaas" />
<cfset payload["email"] = "bklaas@jhu.edu" />
<cfset payload["classes"] = arrayNew(1) />
<cfset payload["classes"][1] = structNew() />
<cfset payload["classes"][1]["courseNumber"] = "550.990.81" />
<cfset payload["classes"][1]["role"] = "Faculty" />
<cfset payload["classes"][2] = structNew() />
<cfset payload["classes"][2]["courseNumber"] = "120.641.01" />
<cfset payload["classes"][2]["role"] = "Student" />


<cfset jsonPayload = SerializeJSON(payload) />
<cfset jsonPayload = Replace(jsonPayload,"//","") />

<!--- The first argument passed to the shell script is the name of the Lambda function that we want to call.
	The second is the JSON payload we want to pass to the Lambda function as the event structure.
	The third is the location of the output .txt file (required by the AWS CLI), where anything you return from the Lambda function goes. --->
<cfset args = arrayNew(1) />
<cfset args[1] = "devObjCustomEvent" />
<cfset args[2] = jsonPayload />
<cfset args[3] = pathToOutputFile />

<cfexecute name = "#pathToBashScript#"
	arguments = "#args#"
    variable = "bashScriptResult"
    errorVariable = "errorFromBashScript"
    timeout = "10">
</cfexecute>

<p>Done.</p>

<cfoutput>
<p>Result = #bashScriptResult#</p>
<p>Error = #errorFromBashScript#</p>
</cfoutput>