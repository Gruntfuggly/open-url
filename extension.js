var vscode = require( 'vscode' );

function activate( context )
{
    context.subscriptions.push( vscode.commands.registerCommand( 'open-url.open', function()
    {
        var editor = vscode.window.activeTextEditor;

        if( editor && editor.document )
        {
            var url = vscode.workspace.getConfiguration( 'open-url' ).get( 'url' );
            var selectedText = editor.document.getText( editor.selection );

            var placeholderRegex = new RegExp( "(\\$\\{(.*?)(/.*/)?})", 'g' );

            var canOpen = true;

            url = url.replace( placeholderRegex, function( fullMatch, placeholder, placeholderName, transformation )
            {
                var replacement;

                if( placeholderName === 'TM_SELECTED_TEXT' )
                {
                    replacement = selectedText;
                }
                else
                {
                    vscode.window.showErrorMessage( "Unsupported placeholder: " + placeholderName );
                    canOpen = false;
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
                            vscode.window.showErrorMessage( "Unsupported transformation: " + transformation );
                            canOpen = false;
                        }
                    }
                }

                return replacement;
            } );

            if( canOpen )
            {
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
        }
    } ) );
}

exports.activate = activate;
exports.deactivate = () => { };
