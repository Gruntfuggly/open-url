var vscode = require( 'vscode' );

function activate( context )
{

    function generateUrl( selectedText, url, showWarning )
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
                if( showWarning )
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

    var placeholderRegex = new RegExp( "(\\$\\{(.*?)(/.*/)?})", 'g' );

    var statusBarItem = vscode.window.createStatusBarItem( vscode.StatusBarAlignment.Right, 0 );
    context.subscriptions.push( statusBarItem );
    statusBarItem.command = "open-url.open";

    context.subscriptions.push( vscode.commands.registerCommand( 'open-url.open', function()
    {
        var editor = vscode.window.activeTextEditor;

        if( editor && editor.document )
        {
            var config = vscode.workspace.getConfiguration( 'open-url', editor.document );
            var regexes = config.get( 'regexes' );
            console.log( JSON.stringify( regexes, null, 2 ) );
            var defaultRegex = config.get( 'regex' );
            var defaultUrl = config.get( 'url' );

            if( defaultRegex )
            {
                regexes[ defaultRegex ] = defaultUrl;
            }

            var selectedText = editor.document.getText( editor.selection );

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
                        if( match[ 1 ] )
                        {
                            argument = match[ 1 ];
                        }
                        url = generateUrl( argument, regexes[ regex ], true );
                        found = true;
                    }
                }
            } );

            if( found == false )
            {
                vscode.window.showInformationMessage( "No URL found?" );
                return;
            }

            var message = "Opening " + url + "...";

            var notification = vscode.workspace.getConfiguration( 'open-url', editor.document ).get( 'notification' );

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

    context.subscriptions.push( vscode.window.onDidChangeTextEditorSelection( function( e )
    {
        var found = false;
        if( e && e.selections.length > 0 )
        {
            var selectedText = e.textEditor.document.getText( e.textEditor.selection ).trim().replace( /(\r\n|\n|\r)/gm, ' ' );

            var config = vscode.workspace.getConfiguration( 'open-url', e.textEditor.document );

            var regexes = config.get( 'regexes' );
            var defaultRegex = config.get( 'regex' );
            var defaultUrl = config.get( 'url' );

            if( defaultRegex )
            {
                regexes[ defaultRegex ] = defaultUrl;
            }

            Object.keys( regexes ).forEach( function( regex )
            {
                if( found === false && regex )
                {
                    var match = selectedText.match( regex );
                    if( match && selectedText.length > 0 )
                    {
                        var argument = selectedText;
                        if( match[ 1 ] )
                        {
                            argument = match[ 1 ];
                        }

                        statusBarItem.tooltip = generateUrl( argument, regexes[ regex ], false );
                        if( selectedText.length > 17 )
                        {
                            selectedText = selectedText.substring( 0, 20 ) + "...";
                        }
                        if( selectedText.length > 0 )
                        {
                            statusBarItem.text = "$(book) " + selectedText;
                            statusBarItem.show();
                            found = true;
                        }
                    }
                }
            } );
        }
        if( found === false )
        {
            statusBarItem.hide();
        }
    } ) );
}

exports.activate = activate;
exports.deactivate = () => { };
