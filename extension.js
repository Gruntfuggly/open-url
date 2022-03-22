var vscode = require( 'vscode' );

function activate( context )
{
    function generateUrl( selectedText, url, generateWarning )
    {
        return url.replace( placeholderRegex, function( fullMatch, placeholder, placeholderName, transformation )
        {
            var replacement;

            if( placeholderName === 'TM_SELECTED_TEXT' )
            {
                replacement = selectedText;
            }
            else
            {
                if( generateWarning )
                {
                    vscode.window.showErrorMessage( "Unsupported placeholder: " + placeholderName );
                }
                replacement = "???";
            }

            if( replacement )
            {
                if( transformation )
                {
                    transformation = transformation.replace( /[\/]/g, '' );
                    if( transformation == 'uppercase' )
                    {
                        replacement = replacement.toUpperCase();
                    }
                    else if( transformation === 'downcase' )
                    {
                        replacement = replacement.toLowerCase();
                    }
                    else
                    {
                        replacement = "???";
                    }
                }
            }

            return replacement;
        } );
    }

    function getUrl( selectedText, generateWarning, editor )
    {

        var regexes = {};
        var configuredRegexes = vscode.workspace.getConfiguration( 'open-url' ).get( 'regexes' );

        Object.keys( configuredRegexes ).forEach( function( regex )
        {
            regexes[ regex ] = configuredRegexes[ regex ];
        } );

        var defaultRegex = vscode.workspace.getConfiguration( 'open-url' ).get( 'regex' );
        var defaultUrl = vscode.workspace.getConfiguration( 'open-url', editor ).get( 'url' );
        console.log( "DEFAULT:" + defaultUrl );

        if( defaultRegex )
        {
            regexes[ defaultRegex ] = defaultUrl;
        }

        var found = false;
        var url;

        Object.keys( regexes ).forEach( function( regex )
        {
            if( found === false && regex )
            {
                var match = selectedText.match( regex );
                if( match && selectedText.length > 0 )
                {
                    var argument = selectedText;
                    console.log( "match:" + JSON.stringify( match ) );
                    if( match[ 1 ] )
                    {
                        argument = match[ 1 ];
                    }
                    url = generateUrl( argument, regexes[ regex ], generateWarning );
                    found = true;
                }
            }
        } );

        if( found == false )
        {
            url = generateUrl( selectedText, defaultUrl, true );
        }

        return url;
    }

    var placeholderRegex = new RegExp( "(\\$\\{(.*?)(/.*/)?})", 'g' );

    var statusBarItem = vscode.window.createStatusBarItem( vscode.StatusBarAlignment.Right, 0 );
    context.subscriptions.push( statusBarItem );
    statusBarItem.command = "open-url.open";

    context.subscriptions.push( vscode.commands.registerCommand( 'open-url.open', function()
    {
        var editor = vscode.window.activeTextEditor;

        if( editor && editor.document )
        {
            var selectedText = editor.document.getText( editor.selection );

            var url = getUrl( selectedText, true, editor );

            if( !url )
            {
                vscode.window.showWarningMessage( "No URL defined?" );
                return;
            }

            var message = "Opening " + url + "...";

            var notification = vscode.workspace.getConfiguration( 'open-url' ).get( 'notification' );

            if( notification === 'popup' )
            {
                vscode.window.showInformationMessage( message );
            }
            else if( notification == 'statusBar' )
            {
                vscode.window.setStatusBarMessage( message, 3000 );
            }

            vscode.env.openExternal( vscode.Uri.parse( url ) );
        }
    } ) );

    context.subscriptions.push( vscode.window.onDidChangeTextEditorSelection( function( editor )
    {
        var found = false;
        if( editor && editor.selections.length > 0 )
        {
            var selectedText = editor.textEditor.document.getText( editor.textEditor.selection ).trim().replace( /(\r\n|\n|\r)/gm, ' ' );

            var url = getUrl( selectedText, false, editor );

            if( url )
            {
                found = true;
                statusBarItem.tooltip = url;
                if( selectedText.length > 17 )
                {
                    selectedText = selectedText.substring( 0, 20 ) + "...";
                }
                if( selectedText.length > 0 )
                {
                    statusBarItem.text = "$(book) " + selectedText;
                    statusBarItem.show();
                }
            }
        }

        if( !found )
        {
            statusBarItem.hide();
        }
    } ) );
}

exports.activate = activate;
exports.deactivate = () => { };
